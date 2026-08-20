import { describe, it, expect } from 'vitest';
import { buildSceneSegments, frameFromWeightedProgress } from '@/lib/cinematic/frame-math';
import { CINEMATIC, SCENE_ORDER } from '@/lib/cinematic/cinematic.config';

const segments = buildSceneSegments(CINEMATIC.scenes, SCENE_ORDER, CINEMATIC.frameCount);
const frameAt = (p: number) => frameFromWeightedProgress(p, segments, CINEMATIC.frameCount);

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
});

describe('frameFromWeightedProgress', () => {
  it('ancora as duas pontas', () => {
    expect(frameAt(0)).toBe(0);
    expect(frameAt(1)).toBe(CINEMATIC.finalFrame);
  });

  it('prende fora da faixa', () => {
    expect(frameAt(-0.5)).toBe(0);
    expect(frameAt(1.5)).toBe(CINEMATIC.finalFrame);
  });

  it('nunca anda para trás', () => {
    let previous = -1;
    for (let i = 0; i <= 4000; i += 1) {
      const frame = frameAt(i / 4000);
      expect(frame).toBeGreaterThanOrEqual(previous);
      previous = frame;
    }
  });

  it('não pula nenhum frame ao varrer o progresso', () => {
    const seen = new Set<number>();
    for (let i = 0; i <= 20000; i += 1) seen.add(frameAt(i / 20000));
    expect(seen.size).toBe(CINEMATIC.frameCount);
  });

  it('comprime a intro: o tubarão entra bem antes do que na proporção do vídeo', () => {
    const total = SCENE_ORDER.reduce((sum, key) => sum + CINEMATIC.scenes[key].scrollWeight, 0);
    const introShare = CINEMATIC.scenes.intro.scrollWeight / total;

    // Fim da intro no scroll cai onde o SharkNews começa em frames.
    expect(frameAt(introShare)).toBe(CINEMATIC.scenes.sharknews.startFrame);

    // Em frames a intro é 18% da sequência; em scroll passa a ser bem menos.
    const shareInFrames = CINEMATIC.scenes.sharknews.startFrame / CINEMATIC.frameCount;
    expect(introShare).toBeLessThan(shareInFrames * 0.7);
    expect(introShare).toBeLessThan(0.12);
  });

  it('com pesos iguais dá a mesma fatia de scroll a cada cena', () => {
    // Pesos iguais não significam mapeamento linear sobre os frames: as cenas
    // têm tamanhos diferentes em frames (43, 67, 58 e 72), então dar a mesma
    // rolagem para cada uma faz o vídeo correr em velocidades diferentes.
    // É exatamente o que o peso existe para controlar.
    const flat = segments.map((s) => ({ ...s, weight: 1 }));
    const at = (p: number) => frameFromWeightedProgress(p, flat, CINEMATIC.frameCount);

    for (let i = 0; i < segments.length; i += 1) {
      expect(at(i / segments.length)).toBe(segments[i]!.startFrame);
    }
    expect(at(1)).toBe(CINEMATIC.finalFrame);
  });

  it('não descarta frame nenhum, seja qual for o peso', () => {
    for (const weights of [[0.35, 1, 1, 1], [1, 1, 1, 1], [0.1, 2, 0.5, 3]]) {
      const tuned = segments.map((s, i) => ({ ...s, weight: weights[i]! }));
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
