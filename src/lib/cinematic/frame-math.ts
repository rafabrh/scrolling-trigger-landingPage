import { SCENE_ORDER, type OverlayWindow, type SceneKey, type SceneRange } from './cinematic.config';

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
export function getSceneProgress(frame: number, scene: SceneRange): number {
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
