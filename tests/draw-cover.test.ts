import { describe, it, expect } from 'vitest';
import { drawCoverDimensions } from '@/lib/cinematic/draw-cover';

const ratio = (r: { dw: number; dh: number }) => r.dw / r.dh;

describe('drawCoverDimensions', () => {
  it('preenche exatamente quando a proporção bate', () => {
    const r = drawCoverDimensions(1600, 900, 800, 450);
    expect(r).toEqual({ dx: 0, dy: 0, dw: 800, dh: 450 });
  });

  it('transborda na horizontal quando o alvo é mais alto que a fonte', () => {
    const r = drawCoverDimensions(1600, 900, 400, 800);
    expect(r.dh).toBe(800);
    expect(r.dw).toBeGreaterThan(400);
    expect(r.dx).toBeLessThan(0);
    expect(r.dy).toBe(0);
  });

  it('transborda na vertical quando o alvo é mais largo que a fonte', () => {
    const r = drawCoverDimensions(864, 1080, 1200, 600);
    expect(r.dw).toBe(1200);
    expect(r.dh).toBeGreaterThan(600);
    expect(r.dy).toBeLessThan(0);
    expect(r.dx).toBe(0);
  });

  it('nunca deforma a imagem', () => {
    const source = 1600 / 900;
    for (const [tw, th] of [[320, 900], [2560, 400], [1000, 1000], [1, 4000]] as const) {
      expect(ratio(drawCoverDimensions(1600, 900, tw, th))).toBeCloseTo(source, 6);
    }
  });

  it('centraliza o transbordo nos dois eixos', () => {
    const r = drawCoverDimensions(1600, 900, 400, 800);
    expect(r.dx).toBeCloseTo((400 - r.dw) / 2, 6);
    expect(r.dy).toBeCloseTo((800 - r.dh) / 2, 6);
  });

  it('cobre o alvo inteiro, sem sobra', () => {
    const r = drawCoverDimensions(1600, 900, 400, 800);
    expect(r.dx).toBeLessThanOrEqual(0);
    expect(r.dy).toBeLessThanOrEqual(0);
    expect(r.dx + r.dw).toBeGreaterThanOrEqual(400);
    expect(r.dy + r.dh).toBeGreaterThanOrEqual(800);
  });

  it('devolve um retângulo vazio quando a fonte é degenerada', () => {
    expect(drawCoverDimensions(0, 900, 800, 450)).toEqual({ dx: 0, dy: 0, dw: 0, dh: 0 });
    expect(drawCoverDimensions(1600, 0, 800, 450)).toEqual({ dx: 0, dy: 0, dw: 0, dh: 0 });
  });

  it('devolve um retângulo vazio quando qualquer lado é NaN', () => {
    const empty = { dx: 0, dy: 0, dw: 0, dh: 0 };
    expect(drawCoverDimensions(NaN, 900, 800, 450)).toEqual(empty);
    expect(drawCoverDimensions(1600, 900, NaN, 450)).toEqual(empty);
    expect(drawCoverDimensions(1600, 900, 800, NaN)).toEqual(empty);
  });
});
