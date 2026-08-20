import { describe, it, expect } from 'vitest';
import { drawCoverDimensions, drawCoverImage } from '@/lib/cinematic/draw-cover';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';

const EMPTY = { dx: 0, dy: 0, dw: 0, dh: 0 };

const stubContext = () => {
  const calls: number[][] = [];
  const ctx = {
    drawImage: (_image: unknown, ...rest: number[]): void => {
      calls.push(rest);
    },
  } as unknown as CanvasRenderingContext2D;
  return { ctx, calls };
};

const IMAGE = {} as CanvasImageSource;

describe('drawCoverDimensions em proporções extremas', () => {
  const cases: ReadonlyArray<readonly [number, number, number, number]> = [
    [4000, 10, 10, 4000],
    [10, 4000, 4000, 10],
    [1600, 900, 1, 1],
    [864, 1080, 3440, 1440],
    [1, 1, 2560, 1440],
  ];

  it('cobre o alvo inteiro sem deformar, em qualquer proporção', () => {
    for (const [sw, sh, tw, th] of cases) {
      const r = drawCoverDimensions(sw, sh, tw, th);
      expect(r.dw / r.dh).toBeCloseTo(sw / sh, 6);
      expect(r.dx).toBeLessThanOrEqual(0);
      expect(r.dy).toBeLessThanOrEqual(0);
      expect(r.dx + r.dw).toBeGreaterThanOrEqual(tw - 1e-9);
      expect(r.dy + r.dh).toBeGreaterThanOrEqual(th - 1e-9);
    }
  });

  it('não amplia mais do que o necessário para cobrir', () => {
    // Um dos dois eixos tem que encostar exato no alvo. Se os dois sobrarem, a
    // imagem está sendo desenhada maior do que precisa e o detalhe se perde.
    for (const [sw, sh, tw, th] of cases) {
      const r = drawCoverDimensions(sw, sh, tw, th);
      expect(Math.min(r.dw - tw, r.dh - th)).toBeCloseTo(0, 6);
    }
  });
});

describe('drawCoverDimensions com tamanho fracionário', () => {
  it('cobre um viewport de devicePixelRatio quebrado', () => {
    // 393.5 x 852.25 é o que sai de um iPhone com dpr 2.625 arredondado em CSS.
    const r = drawCoverDimensions(864, 1080, 393.5, 852.25);
    expect(r.dx + r.dw).toBeGreaterThanOrEqual(393.5 - 1e-9);
    expect(r.dy + r.dh).toBeGreaterThanOrEqual(852.25 - 1e-9);
    expect(r.dw / r.dh).toBeCloseTo(864 / 1080, 9);
  });

  it('centraliza o transbordo mesmo em tamanho quebrado', () => {
    const r = drawCoverDimensions(1600, 900, 393.5, 852.25);
    expect(r.dx).toBeCloseTo((393.5 - r.dw) / 2, 9);
    expect(r.dy).toBeCloseTo((852.25 - r.dh) / 2, 9);
  });

  it('serve as duas resoluções do config sem cortar de menos', () => {
    for (const set of Object.values(CINEMATIC.frameSets)) {
      for (const [tw, th] of [[1920, 1080], [390, 844], [1024, 1366]] as const) {
        const r = drawCoverDimensions(set.width, set.height, tw, th);
        expect(r.dx + r.dw).toBeGreaterThanOrEqual(tw - 1e-9);
        expect(r.dy + r.dh).toBeGreaterThanOrEqual(th - 1e-9);
      }
    }
  });
});

describe('drawCoverDimensions com alvo degenerado', () => {
  it('devolve retângulo vazio quando o canvas ainda não tem tamanho', () => {
    // Acontece no primeiro paint, antes do ResizeObserver medir.
    expect(drawCoverDimensions(1600, 900, 0, 450)).toEqual(EMPTY);
    expect(drawCoverDimensions(1600, 900, 800, 0)).toEqual(EMPTY);
    expect(drawCoverDimensions(1600, 900, 0, 0)).toEqual(EMPTY);
  });

  it('devolve retângulo vazio com medida negativa dos dois lados', () => {
    expect(drawCoverDimensions(1600, 900, -5, 450)).toEqual(EMPTY);
    expect(drawCoverDimensions(-1600, 900, 800, 450)).toEqual(EMPTY);
  });
});

describe('drawCoverImage', () => {
  it('desenha uma vez, com o retângulo calculado', () => {
    const { ctx, calls } = stubContext();
    drawCoverImage(ctx, IMAGE, 1600, 900, 400, 800);
    const r = drawCoverDimensions(1600, 900, 400, 800);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([r.dx, r.dy, r.dw, r.dh]);
  });

  it('não toca no canvas quando não há o que desenhar', () => {
    const { ctx, calls } = stubContext();
    drawCoverImage(ctx, IMAGE, 1600, 900, 0, 0);
    drawCoverImage(ctx, IMAGE, 0, 0, 800, 450);
    expect(calls).toEqual([]);
  });
});
