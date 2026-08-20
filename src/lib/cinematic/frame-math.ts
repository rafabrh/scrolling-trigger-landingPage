import {
  SCENE_ORDER,
  type FrameSpan,
  type OverlayWindow,
  type SceneKey,
  type SceneRange,
} from './cinematic.config';

/** Prende um índice de frame em [0, frameCount - 1] e arredonda. */
export function clampFrame(frame: number, frameCount: number): number {
  if (frameCount <= 0) return 0;
  const rounded = Math.round(frame);
  if (rounded < 0) return 0;
  const last = frameCount - 1;
  return rounded > last ? last : rounded;
}

/** Converte o progresso 0..1 do ScrollTrigger em índice de frame. */
export function frameFromProgress(progress: number, frameCount: number): number {
  if (frameCount <= 0) return 0;
  return clampFrame(progress * (frameCount - 1), frameCount);
}

/** Posição 0..1 de um frame dentro de uma cena. Preso fora dela. */
export function getSceneProgress(frame: number, scene: FrameSpan): number {
  const span = scene.endFrame - scene.startFrame;
  if (span <= 0) return 1;
  const raw = (frame - scene.startFrame) / span;
  if (raw < 0) return 0;
  return raw > 1 ? 1 : raw;
}

/**
 * Opacidade 0..1 de um overlay: rampa de entrada, platô, rampa de saída.
 * Zero fora da janela.
 */
export function getOverlayOpacity(frame: number, window: OverlayWindow): number {
  if (frame <= window.inStart || frame >= window.outEnd) return 0;
  if (frame < window.inEnd) {
    const span = window.inEnd - window.inStart;
    return span <= 0 ? 1 : (frame - window.inStart) / span;
  }
  if (frame <= window.outStart) return 1;
  const span = window.outEnd - window.outStart;
  return span <= 0 ? 0 : 1 - (frame - window.outStart) / span;
}

/**
 * Qual cena está ativa num frame. Numa fronteira compartilhada vence a cena
 * que começa, porque é ela que o usuário está entrando.
 */
export function sceneAtFrame(frame: number, scenes: Record<SceneKey, SceneRange>): SceneKey {
  let active: SceneKey = SCENE_ORDER[0]!;
  for (const key of SCENE_ORDER) {
    if (frame >= scenes[key].startFrame) active = key;
  }
  return active;
}

/** Índice do arquivo que corresponde a um frame do vídeo, dado o passo do conjunto. */
export function fileIndexForFrame(frame: number, frameStep: number): number {
  if (frameStep <= 1) return frame;
  return Math.floor(frame / frameStep);
}

/** Um trecho contíguo de frames com o peso de scroll que ele recebe. */
export interface SceneSegment {
  readonly startFrame: number;
  /** Primeiro frame do trecho seguinte. O último termina em `frameCount`. */
  readonly endFrameExclusive: number;
  readonly weight: number;
}

/**
 * Converte as cenas em trechos contíguos que cobrem a sequência inteira, sem
 * buraco nem sobreposição. Usa o início da cena seguinte como fim da atual,
 * porque as cenas do config compartilham frames de fronteira (110 e 168) e um
 * mapeamento de scroll não pode ter frame pertencendo a dois trechos.
 */
export function buildSceneSegments(
  scenes: Record<SceneKey, SceneRange>,
  order: readonly SceneKey[],
  frameCount: number,
): SceneSegment[] {
  return order.map((key, index) => {
    const nextKey = order[index + 1];
    const scene = scenes[key];
    return {
      startFrame: scene.startFrame,
      endFrameExclusive: nextKey === undefined ? frameCount : scenes[nextKey].startFrame,
      weight: scene.scrollWeight > 0 ? scene.scrollWeight : 1,
    };
  });
}

/**
 * Mapeia o progresso 0..1 do scroll em índice de frame, dando a cada cena a
 * fatia de rolagem que o peso dela pede. Com pesos todos iguais o resultado é
 * idêntico ao `frameFromProgress`. Com a intro em peso menor, ela consome os
 * mesmos frames em menos scroll.
 *
 * A continuidade vem de mapear o local 1 de um trecho no primeiro frame do
 * trecho seguinte: nenhum frame é pulado na fronteira.
 */
export function frameFromWeightedProgress(
  progress: number,
  segments: readonly SceneSegment[],
  frameCount: number,
): number {
  if (frameCount <= 0) return 0;
  if (segments.length === 0) return frameFromProgress(progress, frameCount);

  const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
  if (totalWeight <= 0) return frameFromProgress(clamped, frameCount);

  let consumed = 0;

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i]!;
    const share = segment.weight / totalWeight;
    const isLast = i === segments.length - 1;

    if (isLast || clamped <= consumed + share) {
      const local = share <= 0 ? 1 : (clamped - consumed) / share;
      const span = segment.endFrameExclusive - segment.startFrame;
      return clampFrame(segment.startFrame + local * span, frameCount);
    }

    consumed += share;
  }

  return frameCount - 1;
}
