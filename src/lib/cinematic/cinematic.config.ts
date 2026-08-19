/**
 * Fronteira entre os conjuntos de frame. Vive aqui porque três lugares
 * precisam do mesmo número: a escolha do conjunto em TypeScript, o
 * `media` do fundo, e o `md` do Tailwind.
 */
export const MOBILE_BREAKPOINT_PX = 768;

export type SceneKey = 'intro' | 'sharknews' | 'aiAgent' | 'cityReveal';

export const SCENE_ORDER: readonly SceneKey[] = ['intro', 'sharknews', 'aiAgent', 'cityReveal'] as const;

export interface SceneRange {
  readonly startFrame: number;
  readonly endFrame: number;
  readonly peakFrame?: number;
}

/**
 * Uma janela de overlay em frames absolutos. A opacidade sobe de inStart a
 * inEnd, fica em 1 até outStart, e desce até outEnd.
 */
export interface OverlayWindow {
  readonly inStart: number;
  readonly inEnd: number;
  readonly outStart: number;
  readonly outEnd: number;
}

export interface FrameSet {
  /** Caminho sob /public, sem barra final. */
  readonly dir: string;
  readonly width: number;
  readonly height: number;
  /** Quantos arquivos existem no conjunto. */
  readonly frameCount: number;
  /** 1 = todo frame do vídeo. 2 = um a cada dois. */
  readonly frameStep: number;
  readonly quality: number;
}

export const CINEMATIC = {
  source: 'context/video/rafa3.mp4',
  frameCount: 240,
  fps: 24,
  finalFrame: 239,
  sourceWidth: 1920,
  sourceHeight: 1080,

  scrub: 0.3,
  scrollHeightVh: { desktop: 500, mobile: 350 },

  /**
   * O `as` alarga os quatro literais para `SceneRange`. Sem ele, `as const`
   * fixa cada cena no seu formato exato e `intro` fica sem a propriedade
   * `peakFrame`, o que quebra qualquer leitura genérica por `SceneKey`.
   */
  scenes: {
    intro: { startFrame: 0, endFrame: 42 },
    sharknews: { startFrame: 43, endFrame: 110, peakFrame: 80 },
    aiAgent: { startFrame: 110, endFrame: 168, peakFrame: 140 },
    cityReveal: { startFrame: 168, endFrame: 239 },
  } satisfies Record<SceneKey, SceneRange> as Record<SceneKey, SceneRange>,

  overlays: {
    sharknews: { inStart: 52, inEnd: 68, outStart: 96, outEnd: 106 },
    aiAgent: { inStart: 118, inEnd: 132, outStart: 156, outEnd: 166 },
  } satisfies Record<'sharknews' | 'aiAgent', OverlayWindow>,

  frameSets: {
    desktop: {
      dir: '/cinematic/desktop',
      width: 1600,
      height: 900,
      frameCount: 240,
      frameStep: 1,
      quality: 74,
    },
    mobile: {
      dir: '/cinematic/mobile',
      width: 864,
      height: 1080,
      frameCount: 120,
      frameStep: 2,
      quality: 72,
    },
  } satisfies Record<'desktop' | 'mobile', FrameSet>,

  cache: {
    /** Teto de ImageBitmap decodificados residentes por conjunto. */
    maxDecoded: { desktop: 90, mobile: 40 },
    /** Requisições de rede simultâneas. */
    concurrency: 6,
    /** Raio da janela de pré-carga ao redor do playhead. */
    lookAround: 24,
  },

  assets: {
    finalCity: '/cinematic/final-city.webp',
    poster: '/cinematic/poster.webp',
    manifest: '/cinematic/manifest.json',
  },

  /** Duração do crossfade canvas -> cidade fixa, em segundos. */
  handoffFadeSeconds: 0.2,
} as const;
