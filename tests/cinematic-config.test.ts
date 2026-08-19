import { describe, it, expect } from 'vitest';
import { CINEMATIC, SCENE_ORDER } from '@/lib/cinematic/cinematic.config';

describe('CINEMATIC config', () => {
  it('descreve o vídeo real', () => {
    expect(CINEMATIC.frameCount).toBe(240);
    expect(CINEMATIC.fps).toBe(24);
    expect(CINEMATIC.finalFrame).toBe(CINEMATIC.frameCount - 1);
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
