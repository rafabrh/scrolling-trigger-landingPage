import {
  buildLoadPriority,
  decodeWindowRadius,
  framesToEvict,
  nearestLoadedFrame,
} from './load-policy';
import { fileIndexForFrame } from './frame-math';

export interface FrameCacheOptions {
  readonly dir: string;
  readonly frameCount: number;
  readonly frameStep: number;
  readonly maxDecoded: number;
  readonly concurrency: number;
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

  private playhead = 0;
  private encodedBytes = 0;
  private running = false;
  private disposed = false;
  private firstFrameDelivered = false;
  private pumpScheduled = false;

  constructor(private readonly options: FrameCacheOptions) {}

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

    // A fila raciocina em espaço de frame de vídeo; os dois níveis do cache são
    // chaveados por arquivo. No mobile um arquivo serve dois frames, então o
    // filtro acontece aqui, depois do mapeamento, e não dentro do
    // buildLoadPriority.
    const queue = buildLoadPriority(this.playhead, EMPTY_SET, {
      frameCount: this.options.frameCount,
      finalFrame: this.options.finalFrame,
      headCount: HEAD_COUNT,
      lookAround: this.options.lookAround,
    });

    const playFile = this.fileFor(this.playhead);
    const halfWindow = decodeWindowRadius(this.options.maxDecoded);
    const claimed = new Set<number>();
    let started = 0;

    for (const frame of queue) {
      if (started >= slots) break;

      const file = this.fileFor(frame);
      if (claimed.has(file) || this.inFlight.has(file) || this.abandoned.has(file)) continue;

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
      void this.ensure(file);
    }
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
        const response = await fetch(this.urlForFile(file));
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
    } catch {
      // Um arquivo que falhou não trava a sequência: getNearest cobre o buraco.
      // Ele volta para a fila até esgotar as tentativas, e aí é abandonado.
      const attempts = (this.failures.get(file) ?? 0) + 1;
      this.failures.set(file, attempts);
      if (attempts >= MAX_ATTEMPTS_PER_FRAME) this.abandoned.add(file);
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
