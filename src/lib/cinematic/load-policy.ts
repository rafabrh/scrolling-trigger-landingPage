export interface PriorityOptions {
  readonly frameCount: number;
  readonly finalFrame: number;
  /** Quantos frames iniciais entram logo depois dos dois âncora. */
  readonly headCount: number;
  /** Raio da janela ao redor do playhead. */
  readonly lookAround: number;
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
  const { frameCount, finalFrame, headCount, lookAround } = options;
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

  for (let i = 0; i < frameCount; i += 1) push(i);

  return order;
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
