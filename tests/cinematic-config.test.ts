import { describe, it, expect } from 'vitest';
import {
  CINEMATIC,
  SCENE_ORDER,
  assertSceneBoundaries,
  type SceneKey,
  type SceneRange,
} from '@/lib/cinematic/cinematic.config';

describe('CINEMATIC config', () => {
  it('descreve o vídeo real', () => {
    expect(CINEMATIC.frameCount).toBe(240);
    expect(CINEMATIC.fps).toBe(24);
    expect(CINEMATIC.finalFrame).toBe(CINEMATIC.frameCount - 1);
  });

  it('deriva finalFrame e as contagens de conjunto de frameCount', () => {
    expect(CINEMATIC.finalFrame).toBe(239);
    expect(CINEMATIC.frameSets.desktop.frameCount).toBe(240);
    expect(CINEMATIC.frameSets.mobile.frameCount).toBe(120);
  });

  it('cobre a sequência inteira sem buraco entre cenas', () => {
    const ranges = SCENE_ORDER.map((key) => CINEMATIC.scenes[key]);
    expect(ranges[0]!.startFrame).toBe(0);
    expect(ranges[ranges.length - 1]!.endFrame).toBe(CINEMATIC.finalFrame);
    for (let i = 1; i < ranges.length; i += 1) {
      expect(ranges[i]!.startFrame).toBeLessThanOrEqual(ranges[i - 1]!.endFrame + 1);
      expect(ranges[i]!.startFrame).toBeGreaterThan(ranges[i - 1]!.startFrame);
    }
  });

  it('mantém cada peakFrame dentro da sua cena', () => {
    for (const key of SCENE_ORDER) {
      const scene = CINEMATIC.scenes[key];
      if (scene.peakFrame === undefined) continue;
      expect(scene.peakFrame).toBeGreaterThanOrEqual(scene.startFrame);
      expect(scene.peakFrame).toBeLessThanOrEqual(scene.endFrame);
    }
  });

  it('nunca deixa dois overlays visíveis ao mesmo tempo', () => {
    const { sharknews, aiAgent } = CINEMATIC.overlays;
    expect(sharknews.outEnd).toBeLessThan(aiAgent.inStart);
  });

  it('ordena os quatro marcos de cada janela de overlay', () => {
    for (const w of Object.values(CINEMATIC.overlays)) {
      expect(w.inStart).toBeLessThan(w.inEnd);
      expect(w.inEnd).toBeLessThanOrEqual(w.outStart);
      expect(w.outStart).toBeLessThan(w.outEnd);
      expect(w.outEnd).toBeLessThanOrEqual(CINEMATIC.finalFrame);
    }
  });

  it('deriva a contagem de frames de cada conjunto pelo passo', () => {
    for (const set of Object.values(CINEMATIC.frameSets)) {
      expect(set.frameCount).toBe(Math.ceil(CINEMATIC.frameCount / set.frameStep));
    }
  });
});

describe('assertSceneBoundaries', () => {
  it('aceita o config real, onde toda fronteira é compartilhada', () => {
    expect(() =>
      assertSceneBoundaries(CINEMATIC.scenes, SCENE_ORDER, CINEMATIC.finalFrame),
    ).not.toThrow();
  });

  it('confirma que cada endFrame bate com o startFrame da cena seguinte', () => {
    for (let i = 0; i < SCENE_ORDER.length - 1; i += 1) {
      const scene = CINEMATIC.scenes[SCENE_ORDER[i]!];
      const next = CINEMATIC.scenes[SCENE_ORDER[i + 1]!];
      expect(scene.endFrame).toBe(next.startFrame);
    }
    expect(CINEMATIC.scenes[SCENE_ORDER[SCENE_ORDER.length - 1]!].endFrame).toBe(
      CINEMATIC.finalFrame,
    );
  });

  it('lança quando uma cena não compartilha a fronteira com a seguinte', () => {
    const broken = {
      ...CINEMATIC.scenes,
      // Desencontra intro de sharknews: volta à convenção antiga (42 vs 43).
      intro: { ...CINEMATIC.scenes.intro, endFrame: 42 },
    } as Record<SceneKey, SceneRange>;
    expect(() => assertSceneBoundaries(broken, SCENE_ORDER, CINEMATIC.finalFrame)).toThrow(
      /Fronteira de cena inconsistente/,
    );
  });

  it('lança quando a última cena não termina em finalFrame', () => {
    const broken = {
      ...CINEMATIC.scenes,
      cityReveal: { ...CINEMATIC.scenes.cityReveal, endFrame: 200 },
    } as Record<SceneKey, SceneRange>;
    expect(() => assertSceneBoundaries(broken, SCENE_ORDER, CINEMATIC.finalFrame)).toThrow(
      /finalFrame/,
    );
  });
});
