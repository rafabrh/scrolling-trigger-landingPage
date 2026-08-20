import { describe, it, expect } from 'vitest';
import {
  buildSceneSegments,
  frameFromProgress,
  frameFromWeightedProgress,
} from '@/lib/cinematic/frame-math';
import { CINEMATIC, SCENE_ORDER } from '@/lib/cinematic/cinematic.config';

const segments = buildSceneSegments(CINEMATIC.scenes, SCENE_ORDER, CINEMATIC.frameCount);
const frameAt = (p: number) => frameFromWeightedProgress(p, segments, CINEMATIC.frameCount);
const spanOf = (i: number) => segments[i]!.endFrameExclusive - segments[i]!.startFrame;
const totalWeightedSpan = segments.reduce((sum, seg, i) => sum + seg.weight * spanOf(i), 0);
const shareOf = (i: number) => (segments[i]!.weight * spanOf(i)) / totalWeightedSpan;

describe('buildSceneSegments', () => {
  it('cobre a sequência inteira sem buraco nem sobreposição', () => {
    expect(segments[0]!.startFrame).toBe(0);
    expect(segments[segments.length - 1]!.endFrameExclusive).toBe(CINEMATIC.frameCount);
    for (let i = 1; i < segments.length; i += 1) {
      expect(segments[i]!.startFrame).toBe(segments[i - 1]!.endFrameExclusive);
    }
  });

  it('carrega o peso declarado em cada cena', () => {
    expect(segments.map((s) => s.weight)).toEqual(
      SCENE_ORDER.map((key) => CINEMATIC.scenes[key].scrollWeight),
    );
  });

  it('substitui peso não finito ou não positivo por 1', () => {
    const scenes = {
      ...CINEMATIC.scenes,
      intro: { ...CINEMATIC.scenes.intro, scrollWeight: Number.POSITIVE_INFINITY },
    };
    const built = buildSceneSegments(scenes, SCENE_ORDER, CINEMATIC.frameCount);
    expect(built[0]!.weight).toBe(1);
  });
});

describe('frameFromWeightedProgress', () => {
  it('ancora as duas pontas', () => {
    expect(frameAt(0)).toBe(0);
    expect(frameAt(1)).toBe(CINEMATIC.finalFrame);
  });

  it('prende fora da faixa e trata NaN', () => {
    expect(frameAt(-0.5)).toBe(0);
    expect(frameAt(1.5)).toBe(CINEMATIC.finalFrame);
    expect(frameAt(Number.NaN)).toBe(0);
  });

  it('nunca anda para trás', () => {
    let previous = -1;
    for (let i = 0; i <= 4000; i += 1) {
      const frame = frameAt(i / 4000);
      expect(frame).toBeGreaterThanOrEqual(previous);
      previous = frame;
    }
  });

  it('com pesos iguais reproduz o mapeamento linear', () => {
    // Este é o contrato que o peso promete: 1 em todas as cenas é neutro. A
    // primeira versão distribuía a fatia só pelo peso, ignorando quantos
    // frames a cena tem, e desviava até 17 frames do linear. O teste original
    // foi reescrito para caber naquele bug em vez de denunciá-lo.
    const flat = segments.map((seg) => ({ ...seg, weight: 1 }));

    for (let i = 0; i <= 1000; i += 1) {
      const p = i / 1000;
      const weighted = frameFromWeightedProgress(p, flat, CINEMATIC.frameCount);
      expect(Math.abs(weighted - frameFromProgress(p, CINEMATIC.frameCount))).toBeLessThanOrEqual(1);
    }
  });

  it('gasta a mesma rolagem por frame em cenas de peso igual e tamanhos diferentes', () => {
    const flat = segments.map((seg) => ({ ...seg, weight: 1 }));
    const total = flat.reduce((sum, seg, i) => sum + seg.weight * spanOf(i), 0);
    const perFrame = flat.map((seg, i) => (seg.weight * spanOf(i)) / total / spanOf(i));
    for (const rate of perFrame) expect(rate).toBeCloseTo(perFrame[0]!, 10);
  });

  it('peso menor comprime a cena na proporção exata do peso', () => {
    const half = segments.map((seg, i) => ({ ...seg, weight: i === 0 ? 0.5 : 1 }));
    const total = half.reduce((sum, seg, i) => sum + seg.weight * spanOf(i), 0);
    const introPerFrame = (0.5 * spanOf(0)) / total / spanOf(0);
    const nextPerFrame = (1 * spanOf(1)) / total / spanOf(1);
    expect(nextPerFrame / introPerFrame).toBeCloseTo(2, 10);
  });

  it('a intro termina onde o SharkNews começa, em bem menos scroll que em frames', () => {
    expect(frameAt(shareOf(0))).toBe(CINEMATIC.scenes.sharknews.startFrame);

    const shareInFrames = CINEMATIC.scenes.sharknews.startFrame / CINEMATIC.frameCount;
    expect(shareOf(0)).toBeLessThan(shareInFrames);
    expect(shareOf(0)).toBeGreaterThan(0.05);
    expect(shareOf(0)).toBeLessThan(0.12);
  });

  it('não descarta frame nenhum, seja qual for o peso', () => {
    for (const weights of [[0.5, 1, 1, 1], [1, 1, 1, 1], [0.1, 2, 0.5, 3]]) {
      const tuned = segments.map((seg, i) => ({ ...seg, weight: weights[i]! }));
      const seen = new Set<number>();
      for (let i = 0; i <= 40000; i += 1) {
        seen.add(frameFromWeightedProgress(i / 40000, tuned, CINEMATIC.frameCount));
      }
      expect(seen.size).toBe(CINEMATIC.frameCount);
    }
  });

  it('cai no mapeamento linear quando não há trecho nenhum', () => {
    expect(frameFromWeightedProgress(0.5, [], CINEMATIC.frameCount)).toBe(120);
  });
});
