export interface PriorityOptions {
  readonly frameCount: number;
  readonly finalFrame: number;
  /** Quantos frames iniciais entram logo depois dos dois âncora. */
  readonly headCount: number;
  /** Raio da janela ao redor do playhead. */
  readonly lookAround: number;
  /**
   * Se a cauda (o restante da sequência depois dos âncora, da cabeça e da
   * janela do playhead) já pode ser baixada. Fica `false` até o usuário rolar
   * dentro da seção: assim, com scrollY=0, quem só leu o header e saiu não paga
   * o downlink dos ~236 frames que nunca vai ver. Ausente ou `true` mantém o
   * comportamento antigo, o que preserva os testes que omitem o campo.
   */
  readonly tailUnlocked?: boolean;
}

/**
 * Ordem em que os frames devem ser buscados, do mais urgente ao menos.
 * Primeiro frame, frame final, cabeça da sequência, vizinhança do playhead,
 * e o restante em ordem. O que já está carregado sai da lista.
 */
export function buildLoadPriority(
  currentFrame: number,
  loaded: ReadonlySet<number>,
  options: PriorityOptions,
): number[] {
  const { frameCount, finalFrame, headCount, lookAround, tailUnlocked = true } = options;
  const order: number[] = [];
  const queued = new Set<number>();

  const push = (frame: number): void => {
    // Escrito como afirmação de faixa, e não como negação, porque `NaN < 0` e
    // `NaN >= frameCount` são ambos falsos: a forma negada deixava o NaN passar
    // e a fila pedia `frame-0NaN.webp` à rede.
    if (!(frame >= 0 && frame < frameCount)) return;
    if (queued.has(frame) || loaded.has(frame)) return;
    queued.add(frame);
    order.push(frame);
  };

  push(0);
  push(finalFrame);

  for (let i = 1; i <= headCount; i += 1) push(i);

  // Vizinhança do playhead, alternando para a frente e para trás, porque o
  // scroll pode inverter de direção a qualquer momento.
  push(currentFrame);
  for (let offset = 1; offset <= lookAround; offset += 1) {
    push(currentFrame + offset);
    push(currentFrame - offset);
  }

  // A cauda só entra quando liberada. Com ela travada a fila para na janela do
  // playhead: o pump baixa apenas o urgente e a rede silencia com a página
  // parada em scrollY=0.
  if (tailUnlocked) {
    for (let i = 0; i < frameCount; i += 1) push(i);
  }

  return order;
}

/** Só o `has` de Set/Map por chave numérica: aceita ambos sem alocar. */
export interface HasNumber {
  has(value: number): boolean;
}

/**
 * Diz se o cache não tem mais nada a fazer para o playhead atual, ou seja, se o
 * pump pode retornar cedo sem montar a fila. Puro e sem APIs de browser, então
 * dá para testar sem fetch/createImageBitmap. Verdadeiro só quando VALEM AS
 * DUAS condições:
 *
 * 1. Busca completa: todo arquivo (0..totalFiles-1) já está em `encodedFiles`
 *    ou foi abandonado. Abandonado conta como concluído porque não volta à fila.
 * 2. Decode satisfeito: todo arquivo dentro da janela
 *    [playFile - radius, playFile + radius], preso a [0, totalFiles-1], que NÃO
 *    esteja abandonado, já está em `decodedFiles`. Abandonado dentro da janela
 *    não bloqueia, pois nunca vai decodificar.
 *
 * Quando o playhead se move a janela desliza e arquivos recém-entrados falham a
 * condição 2; quando um decodificado é despejado e volta a ser preciso, também.
 * Assim o early-out nunca engole trabalho real.
 */
export function isCacheSettled(
  playFile: number,
  radius: number,
  totalFiles: number,
  encodedFiles: HasNumber,
  decodedFiles: HasNumber,
  abandonedFiles: HasNumber,
): boolean {
  if (totalFiles <= 0) return true;

  // Condição 1: nada mais a baixar.
  for (let file = 0; file < totalFiles; file += 1) {
    if (!encodedFiles.has(file) && !abandonedFiles.has(file)) return false;
  }

  // Condição 2: janela ao redor do playhead já decodificada.
  const from = playFile - radius < 0 ? 0 : playFile - radius;
  const to = playFile + radius > totalFiles - 1 ? totalFiles - 1 : playFile + radius;
  for (let file = from; file <= to; file += 1) {
    if (abandonedFiles.has(file)) continue;
    if (!decodedFiles.has(file)) return false;
  }

  return true;
}

/** Frame carregado mais próximo do alvo. Empate vai para o menor índice. */
export function nearestLoadedFrame(target: number, loaded: ReadonlyArray<number>): number | null {
  let best: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const frame of loaded) {
    const distance = Math.abs(frame - target);
    if (distance < bestDistance || (distance === bestDistance && best !== null && frame < best)) {
      best = frame;
      bestDistance = distance;
    }
  }

  return best;
}

/**
 * Raio da janela de decode ao redor do playhead, em arquivos, que ainda cabe
 * sob o teto de despejo. A janela tem `2 * raio + 1` arquivos contando o do
 * playhead, então `maxDecoded / 2` produz um arquivo a mais do que o teto
 * aceita: o pump decodifica a borda, o despejo fecha a borda, e o par se
 * repete para sempre queimando CPU com a página parada.
 */
export function decodeWindowRadius(maxDecoded: number): number {
  if (maxDecoded <= 1) return 0;
  return Math.floor((maxDecoded - 1) / 2);
}

/**
 * Quais bitmaps decodificados devem ser fechados para o cache voltar ao teto.
 * Despeja do mais distante do playhead para o mais próximo, e nunca despeja o
 * frame que está em tela.
 */
export function framesToEvict(
  playhead: number,
  decoded: ReadonlyArray<number>,
  maxDecoded: number,
): number[] {
  const excess = decoded.length - maxDecoded;
  if (excess <= 0) return [];

  const candidates = decoded
    .filter((frame) => frame !== playhead)
    .sort((a, b) => Math.abs(b - playhead) - Math.abs(a - playhead));

  return candidates.slice(0, excess);
}
