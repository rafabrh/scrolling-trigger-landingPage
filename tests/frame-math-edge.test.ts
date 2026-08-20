import { describe, it, expect } from 'vitest';
import {
  clampFrame,
  frameFromProgress,
  getSceneProgress,
  getOverlayOpacity,
  fileIndexForFrame,
} from '@/lib/cinematic/frame-math';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';
import type { OverlayWindow } from '@/lib/cinematic/cinematic.config';

const WINDOWS: ReadonlyArray<readonly [string, OverlayWindow]> = [
  ['sharknews', CINEMATIC.overlays.sharknews],
  ['aiAgent', CINEMATIC.overlays.aiAgent],
];

describe('clampFrame com entrada degenerada', () => {
  it('devolve o primeiro frame quando o progresso é indefinido', () => {
    // NaN chega aqui quando a seção tem altura zero e o ScrollTrigger divide
    // por zero. Devolver NaN faria o canvas parar de desenhar em silêncio.
    expect(clampFrame(Number.NaN, 240)).toBe(0);
    expect(Number.isNaN(clampFrame(Number.NaN, 240))).toBe(false);
  });

  it('trata infinito como as pontas da faixa', () => {
    expect(clampFrame(Number.POSITIVE_INFINITY, 240)).toBe(239);
    expect(clampFrame(Number.NEGATIVE_INFINITY, 240)).toBe(0);
  });

  it('devolve sempre 0 numa sequência de um frame só', () => {
    expect(clampFrame(0, 1)).toBe(0);
    expect(clampFrame(50, 1)).toBe(0);
    expect(clampFrame(-50, 1)).toBe(0);
  });

  it('não inventa índice com contagem negativa', () => {
    expect(clampFrame(10, -5)).toBe(0);
  });
});

describe('frameFromProgress com entrada degenerada', () => {
  it('devolve o primeiro frame quando o progresso é NaN', () => {
    expect(frameFromProgress(Number.NaN, 240)).toBe(0);
  });

  it('nunca sai da faixa, seja qual for a entrada', () => {
    for (const p of [-1e9, -1, -0.0001, 0, 0.5, 1, 1.0001, 1e9, Number.NaN]) {
      const frame = frameFromProgress(p, 240);
      expect(Number.isInteger(frame)).toBe(true);
      expect(frame).toBeGreaterThanOrEqual(0);
      expect(frame).toBeLessThanOrEqual(239);
    }
  });

  it('colapsa numa sequência de um frame', () => {
    expect(frameFromProgress(0, 1)).toBe(0);
    expect(frameFromProgress(1, 1)).toBe(0);
  });
});

describe('getSceneProgress com cena degenerada', () => {
  it('devolve 1 quando a cena está invertida', () => {
    expect(getSceneProgress(50, { startFrame: 110, endFrame: 43 })).toBe(1);
  });
});

describe.each(WINDOWS.map(([name, w]) => ({ name, w })))('getOverlayOpacity: janela $name', ({ w }) => {
  it('chega a 0 exato nas duas pontas', () => {
    expect(getOverlayOpacity(w.inStart, w)).toBe(0);
    expect(getOverlayOpacity(w.outEnd, w)).toBe(0);
    expect(getOverlayOpacity(w.inStart - 1, w)).toBe(0);
    expect(getOverlayOpacity(w.outEnd + 1, w)).toBe(0);
  });

  it('tem platô exatamente em 1 de inEnd a outStart', () => {
    for (let f = w.inEnd; f <= w.outStart; f += 1) {
      expect(getOverlayOpacity(f, w)).toBe(1);
    }
    // A borda do platô é fechada dos dois lados: um frame antes ou depois já
    // não vale 1, senão o platô estaria sendo declarado maior do que é.
    expect(getOverlayOpacity(w.inEnd - 1, w)).toBeLessThan(1);
    expect(getOverlayOpacity(w.outStart + 1, w)).toBeLessThan(1);
  });

  it('sobe monotonicamente na entrada e desce na saída', () => {
    let previous = -1;
    for (let f = w.inStart; f <= w.inEnd; f += 1) {
      const value = getOverlayOpacity(f, w);
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
    previous = 2;
    for (let f = w.outStart; f <= w.outEnd; f += 1) {
      const value = getOverlayOpacity(f, w);
      expect(value).toBeLessThan(previous);
      previous = value;
    }
  });

  it('fica em [0, 1] em todo frame da sequência', () => {
    for (let f = -20; f <= CINEMATIC.finalFrame + 20; f += 0.25) {
      const value = getOverlayOpacity(f, w);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('acende no primeiro instante depois de inStart, não no frame seguinte', () => {
    const value = getOverlayOpacity(w.inStart + 0.001, w);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(0.01);
  });

  it('aceita janela sem rampa: liga e desliga na hora', () => {
    const instant: OverlayWindow = { inStart: 52, inEnd: 52, outStart: 96, outEnd: 96 };
    expect(getOverlayOpacity(52, instant)).toBe(0);
    expect(getOverlayOpacity(53, instant)).toBe(1);
    expect(getOverlayOpacity(95, instant)).toBe(1);
    expect(getOverlayOpacity(96, instant)).toBe(0);
  });
});

describe('fileIndexForFrame com passo degenerado', () => {
  it('trata passo 0 e passo negativo como identidade, sem dividir por zero', () => {
    expect(fileIndexForFrame(239, 0)).toBe(239);
    expect(fileIndexForFrame(239, -2)).toBe(239);
    expect(Number.isFinite(fileIndexForFrame(239, 0))).toBe(true);
  });

  it('arredonda para baixo com passo fracionário', () => {
    expect(fileIndexForFrame(5, 2.5)).toBe(2);
  });

  it('mapeia todo frame do vídeo num arquivo que existe em cada conjunto', () => {
    for (const set of Object.values(CINEMATIC.frameSets)) {
      const used = new Set<number>();
      for (let frame = 0; frame < CINEMATIC.frameCount; frame += 1) {
        const file = fileIndexForFrame(frame, set.frameStep);
        expect(file).toBeGreaterThanOrEqual(0);
        expect(file).toBeLessThan(set.frameCount);
        used.add(file);
      }
      // Nenhum arquivo gerado sobra sem frame que o use.
      expect(used.size).toBe(set.frameCount);
    }
  });

  it('nunca anda para trás quando o frame avança', () => {
    for (const set of Object.values(CINEMATIC.frameSets)) {
      let previous = -1;
      for (let frame = 0; frame < CINEMATIC.frameCount; frame += 1) {
        const file = fileIndexForFrame(frame, set.frameStep);
        expect(file).toBeGreaterThanOrEqual(previous);
        previous = file;
      }
    }
  });
});
