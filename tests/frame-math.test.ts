import { describe, it, expect } from 'vitest';
import {
  clampFrame,
  frameFromProgress,
  getSceneProgress,
  getOverlayOpacity,
  sceneAtFrame,
  fileIndexForFrame,
} from '@/lib/cinematic/frame-math';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';

describe('clampFrame', () => {
  it('deixa passar um frame dentro da faixa', () => {
    expect(clampFrame(100, 240)).toBe(100);
  });
  it('prende no piso', () => {
    expect(clampFrame(-5, 240)).toBe(0);
  });
  it('prende no teto', () => {
    expect(clampFrame(999, 240)).toBe(239);
  });
  it('arredonda fracionário', () => {
    expect(clampFrame(10.4, 240)).toBe(10);
    expect(clampFrame(10.6, 240)).toBe(11);
  });
  it('devolve 0 quando não há frame', () => {
    expect(clampFrame(3, 0)).toBe(0);
  });
});

describe('frameFromProgress', () => {
  it('mapeia 0 no primeiro frame', () => {
    expect(frameFromProgress(0, 240)).toBe(0);
  });
  it('mapeia 1 no último frame', () => {
    expect(frameFromProgress(1, 240)).toBe(239);
  });
  it('mapeia o meio no meio', () => {
    expect(frameFromProgress(0.5, 240)).toBe(120);
  });
  it('prende fora da faixa nos dois lados', () => {
    expect(frameFromProgress(-0.4, 240)).toBe(0);
    expect(frameFromProgress(1.7, 240)).toBe(239);
  });
  it('não pula frame em nenhum ponto do percurso', () => {
    const seen = new Set<number>();
    for (let i = 0; i <= 2400; i += 1) seen.add(frameFromProgress(i / 2400, 240));
    expect(seen.size).toBe(240);
  });
});

describe('getSceneProgress', () => {
  const scene = { startFrame: 43, endFrame: 110 };

  it('devolve 0 no primeiro frame da cena', () => {
    expect(getSceneProgress(43, scene)).toBe(0);
  });
  it('devolve 1 no último frame da cena', () => {
    expect(getSceneProgress(110, scene)).toBe(1);
  });
  it('devolve o ponto proporcional no meio', () => {
    expect(getSceneProgress(76.5, scene)).toBeCloseTo(0.5, 5);
  });
  it('prende fora da cena', () => {
    expect(getSceneProgress(10, scene)).toBe(0);
    expect(getSceneProgress(200, scene)).toBe(1);
  });
  it('devolve 1 quando a cena tem um frame só', () => {
    expect(getSceneProgress(43, { startFrame: 43, endFrame: 43 })).toBe(1);
  });
});

describe('getOverlayOpacity', () => {
  const w = { inStart: 52, inEnd: 68, outStart: 96, outEnd: 106 };

  it('fica invisível antes da entrada', () => {
    expect(getOverlayOpacity(0, w)).toBe(0);
    expect(getOverlayOpacity(52, w)).toBe(0);
  });
  it('sobe pela rampa de entrada', () => {
    expect(getOverlayOpacity(60, w)).toBeCloseTo(0.5, 5);
  });
  it('fica cheio no hold', () => {
    expect(getOverlayOpacity(68, w)).toBe(1);
    expect(getOverlayOpacity(80, w)).toBe(1);
    expect(getOverlayOpacity(96, w)).toBe(1);
  });
  it('desce pela rampa de saída', () => {
    expect(getOverlayOpacity(101, w)).toBeCloseTo(0.5, 5);
  });
  it('fica invisível depois da saída', () => {
    expect(getOverlayOpacity(106, w)).toBe(0);
    expect(getOverlayOpacity(239, w)).toBe(0);
  });
  it('nunca deixa os dois overlays visíveis ao mesmo tempo', () => {
    const { sharknews, aiAgent } = CINEMATIC.overlays;
    for (let f = 0; f <= CINEMATIC.finalFrame; f += 1) {
      const both = getOverlayOpacity(f, sharknews) > 0 && getOverlayOpacity(f, aiAgent) > 0;
      expect(both).toBe(false);
    }
  });
});

describe('sceneAtFrame', () => {
  it('identifica cada cena pelo seu frame de pico', () => {
    expect(sceneAtFrame(10, CINEMATIC.scenes)).toBe('intro');
    expect(sceneAtFrame(80, CINEMATIC.scenes)).toBe('sharknews');
    expect(sceneAtFrame(140, CINEMATIC.scenes)).toBe('aiAgent');
    expect(sceneAtFrame(200, CINEMATIC.scenes)).toBe('cityReveal');
  });
  it('resolve a fronteira em favor da cena que começa', () => {
    expect(sceneAtFrame(110, CINEMATIC.scenes)).toBe('aiAgent');
    expect(sceneAtFrame(168, CINEMATIC.scenes)).toBe('cityReveal');
  });
  it('prende fora da faixa', () => {
    expect(sceneAtFrame(-5, CINEMATIC.scenes)).toBe('intro');
    expect(sceneAtFrame(9999, CINEMATIC.scenes)).toBe('cityReveal');
  });
});

describe('fileIndexForFrame', () => {
  it('é identidade quando o passo é 1', () => {
    expect(fileIndexForFrame(137, 1)).toBe(137);
  });
  it('divide pelo passo quando o conjunto é reduzido', () => {
    expect(fileIndexForFrame(0, 2)).toBe(0);
    expect(fileIndexForFrame(1, 2)).toBe(0);
    expect(fileIndexForFrame(2, 2)).toBe(1);
    expect(fileIndexForFrame(239, 2)).toBe(119);
  });
});
