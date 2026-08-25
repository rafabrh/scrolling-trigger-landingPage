/**
 * Fronteira entre os conjuntos de frame. Vive aqui, na camada de ambiente,
 * porque "o que conta como mobile" é uma preocupação de viewport/dispositivo.
 * Três lugares precisam do mesmo número: a escolha do conjunto em TypeScript
 * (`resolveFrameSet` abaixo), o `media` do fundo, e o `md` do Tailwind.
 */
export const MOBILE_BREAKPOINT_PX = 768;

/** `full` roda o scrub inteiro. `reduced` respeita prefers-reduced-motion. `static` nem baixa a sequência. */
export type CinematicMode = 'full' | 'reduced' | 'static';
export type FrameSetName = 'desktop' | 'mobile';

export interface EnvironmentSignals {
  readonly viewportWidth: number;
  readonly prefersReducedMotion: boolean;
  readonly saveData: boolean;
  /** Da Network Information API. `null` onde o browser não expõe. */
  readonly effectiveType: string | null;
  /** Da Device Memory API, em GB. `null` onde o browser não expõe. */
  readonly deviceMemoryGb: number | null;
}

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);
const MIN_DEVICE_MEMORY_GB = 2;

/**
 * `reduced` vem antes de `static`: economia de dados é uma condição da rede, e
 * preferência de movimento é uma decisão da pessoa. A decisão ganha.
 */
export function resolveCinematicMode(signals: EnvironmentSignals): CinematicMode {
  if (signals.prefersReducedMotion) return 'reduced';
  if (signals.saveData) return 'static';
  if (signals.effectiveType !== null && SLOW_CONNECTIONS.has(signals.effectiveType)) return 'static';
  if (signals.deviceMemoryGb !== null && signals.deviceMemoryGb < MIN_DEVICE_MEMORY_GB) return 'static';
  return 'full';
}

/**
 * Estritamente menor que o breakpoint, porque o `max-md` do Tailwind corta em
 * 767.98px. Usar `<=` faria a largura exata de 768 pedir frames mobile com o
 * fundo em CSS de desktop, e a costura do handoff apareceria nesse pixel.
 */
export function resolveFrameSet(signals: EnvironmentSignals): FrameSetName {
  return signals.viewportWidth < MOBILE_BREAKPOINT_PX ? 'mobile' : 'desktop';
}

interface NetworkInformationLike {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

/** Só chamar em Client Component, depois da montagem. */
export function readEnvironmentSignals(): EnvironmentSignals {
  if (typeof window === 'undefined') {
    throw new Error('readEnvironmentSignals precisa do browser');
  }

  const nav = navigator as Navigator & {
    connection?: NetworkInformationLike;
    deviceMemory?: number;
  };

  return {
    viewportWidth: window.innerWidth,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: nav.connection?.saveData === true,
    effectiveType: nav.connection?.effectiveType ?? null,
    deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
  };
}
