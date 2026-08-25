import {
  buildLoadPriority,
  decodeWindowRadius,
  framesToEvict,
  isCacheSettled,
  nearestLoadedFrame,
} from './load-policy';
import { fileIndexForFrame } from './frame-math';

export interface FrameCacheOptions {
  readonly dir: string;
  readonly frameCount: number;
  readonly frameStep: number;
  readonly maxDecoded: number;
  readonly concurrency: number;
  /**
   * Teto de slots que a cauda pode ocupar por pump, uma vez liberada. Fica
   * abaixo de `concurrency` para não roubar downlink da janela do playhead.
   */
  readonly tailConcurrency: number;
  readonly lookAround: number;
  readonly finalFrame: number;
}

const HEAD_COUNT = 30;

/**
 * Quantas vezes um frame pode falhar antes de sair da fila para sempre. Sem
 * teto, um diretório ausente em produção vira tempestade de 404 no ritmo do
 * pump: a fila reoferece o mesmo frame indefinidamente porque ele nunca entra
 * em `encoded`. Com teto, o buraco fica coberto por `getNearest` e a rede
 * silencia.
 */
const MAX_ATTEMPTS_PER_FRAME = 3;

const EMPTY_SET: ReadonlySet<number> = new Set();

/**
 * Guarda a sequência em dois níveis. O nível encoded segura o Blob de todo
 * frame já baixado, cerca de 70 KB cada. O nível decoded segura ImageBitmap
 * prontos numa janela ao redor do playhead, cerca de 5,8 MB cada, e fecha o
 * que sai da janela. Sem essa separação, 240 bitmaps residentes passariam de
 * 1 GB.
 */
export class FrameCache {
  private readonly encoded = new Map<number, Blob>();
  private readonly decoded = new Map<number, ImageBitmap>();
  private readonly inFlight = new Set<number>();
  private readonly failures = new Map<number, number>();
  private readonly abandoned = new Set<number>();
  private readonly firstFrameCallbacks: Array<() => void> = [];

  /**
   * Aborta os fetches em voo quando a instância é descartada. O FrameCache é
   * de uso único (o hook cria um novo a cada mount e chama dispose no
   * cleanup), então um único controller criado na construção e abortado uma
   * vez em dispose basta — sem controllers por fetch.
   */
  private readonly abortController = new AbortController();

  private playhead = 0;
  private encodedBytes = 0;
  private running = false;
  private disposed = false;
  private firstFrameDelivered = false;
  private pumpScheduled = false;

  /**
   * Começa travada: `start()` pumpa em playhead 0 e baixa só o urgente. O
   * primeiro scroll real dentro da seção libera a cauda (ver `setPlayhead`).
   */
  private tailUnlocked = false;

  /**
   * Número de arquivos distintos da sequência, derivado do mapeamento
   * frame->arquivo do último frame (mobile step 2 divide por dois). Nunca
   * hardcode 240: o teto muda com frameCount e frameStep. Memoizado porque o
   * early-out do pump o lê a cada quadro de scroll.
   */
  private readonly totalFiles: number;

  constructor(private readonly options: FrameCacheOptions) {
    this.totalFiles =
      options.frameCount <= 0 ? 0 : this.fileFor(options.frameCount - 1) + 1;
  }

  get stats(): { decoded: number; encoded: number; bytes: number } {
    return { decoded: this.decoded.size, encoded: this.encoded.size, bytes: this.encodedBytes };
  }

  onFirstFrame(callback: () => void): void {
    if (this.firstFrameDelivered) {
      callback();
      return;
    }
    this.firstFrameCallbacks.push(callback);
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.pump();
  }

  setPlayhead(frame: number): void {
    if (this.playhead === frame) return;
    // Playhead saindo do 0 é o sinal de scroll real dentro da seção: a partir
    // daqui o usuário está de fato consumindo a sequência, então a cauda pode
    // ser liberada. Uma vez destravada, fica destravada.
    if (frame > 0) this.tailUnlocked = true;
    this.playhead = frame;
    this.evict();
    this.schedulePump();
  }

  /**
   * Índice do arquivo que serve um frame. No conjunto mobile o passo é 2, então
   * dois frames de vídeo compartilham o mesmo `.webp`. Chavear os dois níveis
   * do cache por arquivo, e não por frame, evita baixar e decodificar a mesma
   * imagem duas vezes.
   */
  private fileFor(frame: number): number {
    return fileIndexForFrame(frame, this.options.frameStep);
  }

  /** Bitmap exato do frame, ou null se ele ainda não está decodificado. */
  get(frame: number): ImageBitmap | null {
    return this.decoded.get(this.fileFor(frame)) ?? null;
  }

  /** Bitmap do frame, ou o mais próximo disponível. Evita canvas vazio. */
  getNearest(frame: number): ImageBitmap | null {
    const file = this.fileFor(frame);
    const exact = this.decoded.get(file);
    if (exact) return exact;

    // Varredura no lugar. O spread das chaves alocava um array de ate 90
    // posicoes a cada quadro em que o exato faltasse, ou seja, durante todo o
    // carregamento inicial, que e justamente quando o decodificador ja esta
    // disputando a main thread. Empate resolve pelo menor indice, igual ao
    // nearestLoadedFrame que os testes cobrem.
    let best: ImageBitmap | null = null;
    let bestFile = Number.POSITIVE_INFINITY;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const [candidate, bitmap] of this.decoded) {
      const distance = Math.abs(candidate - file);
      if (distance < bestDistance || (distance === bestDistance && candidate < bestFile)) {
        best = bitmap;
        bestFile = candidate;
        bestDistance = distance;
      }
    }

    return best;
  }

  dispose(): void {
    this.disposed = true;
    this.running = false;
    // Aborta já: cancela qualquer fetch em voo antes de limpar o resto, para a
    // rede parar de baixar bytes cujo resultado seria descartado.
    this.abortController.abort();
    for (const bitmap of this.decoded.values()) bitmap.close();
    this.decoded.clear();
    this.encoded.clear();
    this.inFlight.clear();
    this.encodedBytes = 0;
    this.failures.clear();
    this.abandoned.clear();
    this.firstFrameCallbacks.length = 0;
  }

  private urlForFile(file: number): string {
    return `${this.options.dir}/frame-${String(file).padStart(4, '0')}.webp`;
  }

  private schedulePump(): void {
    if (this.pumpScheduled || !this.running || this.disposed) return;
    this.pumpScheduled = true;
    queueMicrotask(() => {
      this.pumpScheduled = false;
      this.pump();
    });
  }

  private pump(): void {
    if (!this.running || this.disposed) return;

    const slots = this.options.concurrency - this.inFlight.size;
    if (slots <= 0) return;

    // Early-out no caminho quente do scroll: uma vez que a sequência inteira
    // está baixada e a janela ao redor do playhead está decodificada, não há
    // nada a iniciar, e montar/varrer a fila de até `frameCount` posições a
    // cada quadro é alocação e iteração puras. Predicado puro e testável decide
    // aqui; qualquer trabalho pendente (fetch faltando, janela deslocando,
    // bitmap despejado) reprova a condição e o pump segue normal.
    if (
      isCacheSettled(
        this.fileFor(this.playhead),
        decodeWindowRadius(this.options.maxDecoded),
        this.totalFiles,
        this.encoded,
        this.decoded,
        this.abandoned,
      )
    ) {
      return;
    }

    // A fila raciocina em espaço de frame de vídeo; os dois níveis do cache são
    // chaveados por arquivo. No mobile um arquivo serve dois frames, então o
    // filtro acontece aqui, depois do mapeamento, e não dentro do
    // buildLoadPriority.
    const queue = buildLoadPriority(this.playhead, EMPTY_SET, {
      frameCount: this.options.frameCount,
      finalFrame: this.options.finalFrame,
      headCount: HEAD_COUNT,
      lookAround: this.options.lookAround,
      tailUnlocked: this.tailUnlocked,
    });

    const playFile = this.fileFor(this.playhead);
    const halfWindow = decodeWindowRadius(this.options.maxDecoded);
    const claimed = new Set<number>();
    let started = 0;
    // Enquanto a cauda está travada a fila já vem só com urgentes e este contador
    // fica ocioso. Liberada a cauda, a fila vem completa: contamos quantos frames
    // de cauda (fora da janela urgente) já iniciamos e paramos de iniciar cauda
    // ao bater `tailConcurrency`, sem bloquear os urgentes.
    let tailStarted = 0;

    for (const frame of queue) {
      if (started >= slots) break;

      const file = this.fileFor(frame);
      if (claimed.has(file) || this.inFlight.has(file) || this.abandoned.has(file)) continue;

      // A cauda não pode saturar o downlink: cada pump só inicia até
      // `tailConcurrency` frames dela. Urgentes (âncora, cabeça, janela do
      // playhead) seguem podendo usar a concorrência cheia.
      const isTail = !this.isUrgent(frame, playFile);
      if (isTail && tailStarted >= this.options.tailConcurrency) continue;

      // Duas espécies de trabalho, e o segundo é o que faltava. Baixar é
      // finito: cada arquivo entra em `encoded` uma vez e acabou. Decodificar
      // não é: o despejo fecha bitmaps o tempo todo, e um arquivo que já está
      // em `encoded` continua precisando de bitmap quando o playhead volta
      // para perto dele.
      const needsFetch = !this.encoded.has(file);
      const needsDecode = !this.decoded.has(file) && Math.abs(file - playFile) <= halfWindow;
      if (!needsFetch && !needsDecode) continue;

      claimed.add(file);
      started += 1;
      if (isTail) tailStarted += 1;
      void this.ensure(file);
    }
  }

  /**
   * Um frame é urgente quando o usuário pode encostar nele já: os dois âncora
   * (0 e finalFrame), a cabeça da sequência (1..HEAD_COUNT) e a janela ao redor
   * do playhead. Comparado em espaço de arquivo porque é assim que os slots são
   * contados; a janela usa `lookAround` para casar com a que o buildLoadPriority
   * monta. O resto é cauda.
   */
  private isUrgent(frame: number, playFile: number): boolean {
    if (frame === 0 || frame === this.options.finalFrame) return true;
    if (frame >= 1 && frame <= HEAD_COUNT) return true;
    return Math.abs(this.fileFor(frame) - playFile) <= this.options.lookAround;
  }

  /**
   * Garante que o arquivo tenha blob e, quando estiver dentro da janela,
   * bitmap. Reaproveita o blob residente: redecodificar custa milissegundos
   * de CPU e zero de rede.
   */
  private async ensure(file: number): Promise<void> {
    if (this.inFlight.has(file) || this.abandoned.has(file) || this.disposed) return;
    this.inFlight.add(file);

    try {
      let blob = this.encoded.get(file);

      if (blob === undefined) {
        const response = await fetch(this.urlForFile(file), {
          signal: this.abortController.signal,
        });
        if (!response.ok) throw new Error(`frame file ${file}: HTTP ${response.status}`);

        blob = await response.blob();
        if (this.disposed) return;

        this.encoded.set(file, blob);
        this.encodedBytes += blob.size;
      }

      // O pump inicia `ensure` tambem para arquivos que so precisam ser
      // baixados, como a cabeca da sequencia e o frame final, que ficam bem
      // fora da janela. Decodificar esses seria alocar um bitmap de varios
      // megabytes para o despejo fechar na linha seguinte. A janela e relida
      // aqui e nao antes do await, porque o playhead se move durante o fetch.
      const radius = decodeWindowRadius(this.options.maxDecoded);
      if (Math.abs(file - this.fileFor(this.playhead)) <= radius) {
        await this.decode(file, blob);
      }

      // Sucesso zera o orcamento de tentativas. Sem isto o contador so sobe, e
      // um arquivo que falhou num soluco de rede e depois funcionou seria
      // abandonado para sempre na primeira falha seguinte.
      this.failures.delete(file);
    } catch (error) {
      // Fetch abortado no dispose não é falha real: a instância está sendo
      // descartada e o resultado seria jogado fora de qualquer jeito. Sai antes
      // de mexer em failures/abandoned para não marcar o arquivo como morto.
      if (this.disposed) return;
      // Um arquivo que falhou não trava a sequência: getNearest cobre o buraco.
      // Ele volta para a fila até esgotar as tentativas, e aí é abandonado.
      const attempts = (this.failures.get(file) ?? 0) + 1;
      this.failures.set(file, attempts);
      if (attempts >= MAX_ATTEMPTS_PER_FRAME) {
        this.abandoned.add(file);
        // Uma linha por arquivo morto, e não uma por tentativa. O catch antes
        // era mudo: combinado com um diretório ausente em produção, a sequência
        // inteira dava 404 e nada aparecia em lugar nenhum. Warn, não error,
        // porque getNearest mantém a tela preenchida — é degradação, não queda.
        console.warn(`[cinematic] arquivo ${file} abandonado após ${attempts} tentativas:`, error);
      }
    } finally {
      this.inFlight.delete(file);
      if (!this.disposed) this.schedulePump();
    }
  }

  private async decode(file: number, blob: Blob): Promise<void> {
    if (this.decoded.has(file) || this.disposed) return;

    const bitmap = await createImageBitmap(blob);
    if (this.disposed) {
      bitmap.close();
      return;
    }

    this.decoded.set(file, bitmap);
    this.evict();

    if (!this.firstFrameDelivered) {
      this.firstFrameDelivered = true;
      for (const callback of this.firstFrameCallbacks) callback();
      this.firstFrameCallbacks.length = 0;
    }
  }

  private evict(): void {
    const doomed = framesToEvict(
      this.fileFor(this.playhead),
      [...this.decoded.keys()],
      this.options.maxDecoded,
    );
    for (const file of doomed) {
      this.decoded.get(file)?.close();
      this.decoded.delete(file);
    }
  }
}
