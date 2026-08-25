import framesConfig from './frames.config.json';

export type SceneKey = 'intro' | 'sharknews' | 'aiAgent' | 'cityReveal';

export const SCENE_ORDER: readonly SceneKey[] = ['intro', 'sharknews', 'aiAgent', 'cityReveal'] as const;

/** O intervalo de frames de um trecho. É tudo que `getSceneProgress` precisa. */
export interface FrameSpan {
  readonly startFrame: number;
  readonly endFrame: number;
}

export interface SceneRange extends FrameSpan {
  readonly peakFrame?: number;
  /**
   * Quanta distância de scroll esta cena recebe, em relação às outras. O
   * padrão seria 1 para todas, o que faz o scroll andar na mesma velocidade
   * do vídeo. Peso menor comprime a cena: ela consome os mesmos frames em
   * menos rolagem, e passa mais rápido sem perder um quadro sequer.
   */
  readonly scrollWeight: number;
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
}

/**
 * Fonte única, compartilhada com `scripts/build-frames.mjs` via
 * `frames.config.json`. `quality` e `crop` são parâmetros de encoder sem
 * significado em runtime, então ficam só no JSON e não entram no shape abaixo.
 * Todo o resto — `finalFrame`, a contagem de cada conjunto — deriva daqui, para
 * não haver dois números que possam desencontrar num edit futuro.
 */
const FRAME_COUNT = framesConfig.source.frameCount;

export const CINEMATIC = {
  source: 'context/video/rafa3.mp4',
  frameCount: FRAME_COUNT,
  fps: framesConfig.source.fps,
  // Derivado: o último índice de um conjunto de FRAME_COUNT frames.
  finalFrame: FRAME_COUNT - 1,
  sourceWidth: framesConfig.source.width,
  sourceHeight: framesConfig.source.height,

  scrub: 0.3,
  scrollHeightVh: { desktop: 500, mobile: 350 },

  /**
   * O `as` alarga os quatro literais para `SceneRange`. Sem ele, `as const`
   * fixa cada cena no seu formato exato e `intro` fica sem a propriedade
   * `peakFrame`, o que quebra qualquer leitura genérica por `SceneKey`.
   */
  scenes: {
    // A intro é o mergulho entre os prédios, sem elemento gráfico. Com peso 1
    // ela come 18% do scroll antes de qualquer coisa acontecer, e a abertura
    // arrasta. Em 0.35 o tubarão começa a entrar por volta de 10% da rolagem.
    // 0.5 com a fatia normalizada pelo span da ~9,8% da rolagem, que e onde a
    // intro ja estava. Peso e multiplicador de velocidade: 0.5 toca a cena ao
    // dobro da velocidade natural.
    // Convenção uniforme de fronteira: o `endFrame` de cada cena é igual ao
    // `startFrame` da cena seguinte (fronteira compartilhada), e o `endFrame`
    // da última cena é o `finalFrame`. A intro era a exceção (endFrame 42 /
    // sharknews 43); alinhada para 43 ela passa a compartilhar a fronteira como
    // todas as outras. O timing visual não muda: `buildSceneSegments` usa o
    // `startFrame` da cena seguinte como fim exclusivo e ignora `endFrame`, e a
    // intro não tem overlay, então `getSceneProgress` da intro não alimenta
    // nenhuma opacidade em tela — só o dev-time assert enxerga essa diferença.
    intro: { startFrame: 0, endFrame: 43, scrollWeight: 0.5 },
    sharknews: { startFrame: 43, endFrame: 110, peakFrame: 80, scrollWeight: 1 },
    aiAgent: { startFrame: 110, endFrame: 168, peakFrame: 140, scrollWeight: 1 },
    cityReveal: { startFrame: 168, endFrame: 239, scrollWeight: 1 },
  } satisfies Record<SceneKey, SceneRange> as Record<SceneKey, SceneRange>,

  overlays: {
    sharknews: { inStart: 52, inEnd: 68, outStart: 96, outEnd: 106 },
    aiAgent: { inStart: 118, inEnd: 132, outStart: 156, outEnd: 166 },
  } satisfies Record<'sharknews' | 'aiAgent', OverlayWindow>,

  frameSets: {
    desktop: {
      dir: `/cinematic/${framesConfig.sets.desktop.dir}`,
      width: framesConfig.sets.desktop.width,
      height: framesConfig.sets.desktop.height,
      // Derivado: passo 1 usa todos os frames.
      frameCount: Math.ceil(FRAME_COUNT / framesConfig.sets.desktop.frameStep),
      frameStep: framesConfig.sets.desktop.frameStep,
    },
    mobile: {
      dir: `/cinematic/${framesConfig.sets.mobile.dir}`,
      width: framesConfig.sets.mobile.width,
      height: framesConfig.sets.mobile.height,
      // Derivado: passo 2 usa um a cada dois frames (240 / 2 = 120).
      frameCount: Math.ceil(FRAME_COUNT / framesConfig.sets.mobile.frameStep),
      frameStep: framesConfig.sets.mobile.frameStep,
    },
  } satisfies Record<'desktop' | 'mobile', FrameSet>,

  cache: {
    /** Teto de ImageBitmap decodificados residentes por conjunto. */
    maxDecoded: { desktop: 90, mobile: 40 },
    /** Requisições de rede simultâneas. */
    concurrency: 6,
    /**
     * Teto de requisições simultâneas dedicadas à cauda, uma vez liberada.
     * Menor que `concurrency` de propósito: a cauda não pode saturar o downlink
     * e disputar banda com a janela do playhead, que é o que o usuário vê agora.
     */
    tailConcurrency: 2,
    /** Raio da janela de pré-carga ao redor do playhead. */
    lookAround: 24,
  },

  assets: {
    finalCity: '/cinematic/final-city.webp',
    finalCityMobile: '/cinematic/final-city-mobile.webp',
    poster: '/cinematic/poster.webp',
    manifest: '/cinematic/manifest.json',
  },

  /** Duração do crossfade canvas -> cidade fixa, em segundos. */
  handoffFadeSeconds: 0.2,
} as const;

/**
 * Verifica a convenção de fronteira: cada cena termina (`endFrame`) exatamente
 * onde a seguinte começa (`startFrame`), e a última termina em `finalFrame`.
 * Lança em desenvolvimento se um edit futuro desencontrar as duas pontas.
 * Exportada para poder ser testada isoladamente.
 */
export function assertSceneBoundaries(
  scenes: Record<SceneKey, SceneRange>,
  order: readonly SceneKey[],
  finalFrame: number,
): void {
  for (let i = 0; i < order.length; i += 1) {
    const key = order[i]!;
    const scene = scenes[key];
    const nextKey = order[i + 1];
    const expectedEnd = nextKey === undefined ? finalFrame : scenes[nextKey].startFrame;
    if (scene.endFrame !== expectedEnd) {
      throw new Error(
        `Fronteira de cena inconsistente: '${key}'.endFrame (${scene.endFrame}) deveria ser ` +
          `${expectedEnd} (${nextKey === undefined ? 'finalFrame' : `'${nextKey}'.startFrame`}). ` +
          'Todas as cenas devem compartilhar a fronteira: endFrame === startFrame da próxima.',
      );
    }
  }
}

// Roda uma vez, só em desenvolvimento: em produção o custo é zero.
if (process.env.NODE_ENV !== 'production') {
  assertSceneBoundaries(CINEMATIC.scenes, SCENE_ORDER, CINEMATIC.finalFrame);
}
