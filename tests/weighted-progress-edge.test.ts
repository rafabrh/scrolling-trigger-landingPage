import { describe, it, expect } from 'vitest';
import {
  buildSceneSegments,
  frameFromWeightedProgress,
  type SceneSegment,
} from '@/lib/cinematic/frame-math';
import { CINEMATIC, SCENE_ORDER, type SceneKey, type SceneRange } from '@/lib/cinematic/cinematic.config';

const scenesWithWeights = (weights: readonly number[]): Record<SceneKey, SceneRange> => {
  const out: Record<string, SceneRange> = {};
  SCENE_ORDER.forEach((key, index) => {
    out[key] = { ...CINEMATIC.scenes[key], scrollWeight: weights[index]! };
  });
  return out as Record<SceneKey, SceneRange>;
};

const sweep = (segments: readonly SceneSegment[], frameCount: number, steps = 20000): number[] => {
  const frames: number[] = [];
  for (let i = 0; i <= steps; i += 1) {
    frames.push(frameFromWeightedProgress(i / steps, segments, frameCount));
  }
  return frames;
};

describe('buildSceneSegments com peso degenerado', () => {
  it('troca peso zero, negativo e NaN pelo peso neutro', () => {
    // Peso zero significaria uma cena que consome scroll nenhum: o mapeamento
    // saltaria os frames dela inteiros. Um erro de digitação no config não
    // pode apagar uma cena da sequência.
    const segments = buildSceneSegments(
      scenesWithWeights([0, -3, Number.NaN, 1]),
      SCENE_ORDER,
      CINEMATIC.frameCount,
    );
    expect(segments.map((s) => s.weight)).toEqual([1, 1, 1, 1]);
  });

  it('continua cobrindo a sequência inteira mesmo com pesos inválidos', () => {
    const segments = buildSceneSegments(
      scenesWithWeights([0, 0, 0, 0]),
      SCENE_ORDER,
      CINEMATIC.frameCount,
    );
    const frames = sweep(segments, CINEMATIC.frameCount);
    expect(new Set(frames).size).toBe(CINEMATIC.frameCount);
    expect(frames[0]).toBe(0);
    expect(frames[frames.length - 1]).toBe(CINEMATIC.finalFrame);
  });

  it('devolve trecho nenhum quando não há cena na ordem', () => {
    expect(buildSceneSegments(CINEMATIC.scenes, [], CINEMATIC.frameCount)).toEqual([]);
  });

  it('estica a única cena até o fim quando a ordem tem um nome só', () => {
    const segments = buildSceneSegments(CINEMATIC.scenes, ['sharknews'], CINEMATIC.frameCount);
    expect(segments).toHaveLength(1);
    expect(segments[0]!.startFrame).toBe(CINEMATIC.scenes.sharknews.startFrame);
    expect(segments[0]!.endFrameExclusive).toBe(CINEMATIC.frameCount);
  });
});

describe('frameFromWeightedProgress com entrada degenerada', () => {
  const segments = buildSceneSegments(CINEMATIC.scenes, SCENE_ORDER, CINEMATIC.frameCount);

  it('devolve o primeiro frame quando o progresso é NaN', () => {
    const frame = frameFromWeightedProgress(Number.NaN, segments, CINEMATIC.frameCount);
    expect(frame).toBe(0);
    expect(Number.isNaN(frame)).toBe(false);
  });

  it('trata infinito como as pontas do scroll', () => {
    expect(frameFromWeightedProgress(Number.POSITIVE_INFINITY, segments, CINEMATIC.frameCount)).toBe(
      CINEMATIC.finalFrame,
    );
    expect(frameFromWeightedProgress(Number.NEGATIVE_INFINITY, segments, CINEMATIC.frameCount)).toBe(0);
  });

  it('devolve 0 quando não há frame nenhum', () => {
    expect(frameFromWeightedProgress(0.5, segments, 0)).toBe(0);
  });

  it('colapsa numa sequência de um frame', () => {
    const single = buildSceneSegments(CINEMATIC.scenes, SCENE_ORDER, 1);
    for (const p of [0, 0.5, 1]) {
      expect(frameFromWeightedProgress(p, single, 1)).toBe(0);
    }
  });

  it('percorre a sequência inteira com um trecho só', () => {
    const one: SceneSegment[] = [{ startFrame: 0, endFrameExclusive: 240, weight: 1 }];
    const frames = sweep(one, 240);
    expect(frames[0]).toBe(0);
    expect(frames[frames.length - 1]).toBe(239);
    expect(new Set(frames).size).toBe(240);
  });

  it('atravessa trecho de comprimento zero sem travar nem produzir NaN', () => {
    // Duas cenas começando no mesmo frame produzem um trecho vazio. Ele não
    // pode consumir scroll parando o vídeo, nem envenenar o índice.
    const withEmpty: SceneSegment[] = [
      { startFrame: 0, endFrameExclusive: 0, weight: 1 },
      { startFrame: 0, endFrameExclusive: 240, weight: 1 },
    ];
    const frames = sweep(withEmpty, 240);
    expect(frames.every((f) => Number.isInteger(f))).toBe(true);
    expect(frames[0]).toBe(0);
    expect(frames[frames.length - 1]).toBe(239);
    for (let i = 1; i < frames.length; i += 1) {
      expect(frames[i]!).toBeGreaterThanOrEqual(frames[i - 1]!);
    }
  });

  it('cai no mapeamento linear quando os pesos somam zero ou menos', () => {
    const dead: SceneSegment[] = [
      { startFrame: 0, endFrameExclusive: 120, weight: 0 },
      { startFrame: 120, endFrameExclusive: 240, weight: 0 },
    ];
    expect(frameFromWeightedProgress(0, dead, 240)).toBe(0);
    expect(frameFromWeightedProgress(0.5, dead, 240)).toBe(120);
    expect(frameFromWeightedProgress(1, dead, 240)).toBe(239);
  });
});

describe('frameFromWeightedProgress: o peso é multiplicador de velocidade', () => {
  it('respeita a fronteira de cada cena com a fatia proporcional a peso x span', () => {
    // A fatia NÃO é `peso / soma dos pesos`. É `peso * frames / soma`. Sem o
    // span, cenas de tamanhos diferentes com o mesmo peso recebem a mesma
    // rolagem e a velocidade salta em cada fronteira, e peso 1 em todas deixa
    // de reproduzir o mapeamento linear.
    const weights = [1, 2, 1, 1];
    const segments = buildSceneSegments(scenesWithWeights(weights), SCENE_ORDER, CINEMATIC.frameCount);
    const spans = segments.map((seg) => seg.endFrameExclusive - seg.startFrame);
    const total = segments.reduce((sum, seg, i) => sum + seg.weight * spans[i]!, 0);

    let consumed = 0;
    for (let i = 0; i < segments.length; i += 1) {
      expect(frameFromWeightedProgress(consumed, segments, CINEMATIC.frameCount)).toBe(
        segments[i]!.startFrame,
      );

      const share = (segments[i]!.weight * spans[i]!) / total;
      const middle = frameFromWeightedProgress(consumed + share / 2, segments, CINEMATIC.frameCount);
      expect(middle).toBeGreaterThanOrEqual(segments[i]!.startFrame);
      expect(middle).toBeLessThan(segments[i]!.endFrameExclusive);
      consumed += share;
    }
    expect(consumed).toBeCloseTo(1, 10);
  });

  it('a cena de peso maior consome mais scroll que a de peso menor, no mesmo número de frames', () => {
    // sharknews (43..110) e aiAgent (110..168) têm tamanhos parecidos em frames.
    // Com peso 3 contra 1, a primeira tem que ocupar perto do triplo da rolagem.
    const segments = buildSceneSegments(scenesWithWeights([1, 3, 1, 1]), SCENE_ORDER, CINEMATIC.frameCount);
    const frames = sweep(segments, CINEMATIC.frameCount, 60000);

    const inSegment = (index: number) =>
      frames.filter(
        (f) => f >= segments[index]!.startFrame && f < segments[index]!.endFrameExclusive,
      ).length;

    // sharknews tem 67 frames e aiAgent 58, entao a razao esperada e
    // 3 * 67 / 58 = 3.47, nao 3: o span entra na conta junto com o peso.
    const expected = (3 * 67) / 58;
    const ratio = inSegment(1) / inSegment(2);
    expect(ratio).toBeGreaterThan(expected * 0.97);
    expect(ratio).toBeLessThan(expected * 1.03);
  });
});
