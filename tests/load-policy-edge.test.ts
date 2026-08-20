import { describe, it, expect } from 'vitest';
import {
  buildLoadPriority,
  decodeWindowRadius,
  framesToEvict,
  nearestLoadedFrame,
} from '@/lib/cinematic/load-policy';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';

const OPTS = { frameCount: 240, finalFrame: 239, headCount: 30, lookAround: 24 };
const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe('framesToEvict com teto degenerado', () => {
  it('com teto zero esvazia tudo menos o frame em tela', () => {
    const decoded = [0, 50, 120, 239];
    const evicted = framesToEvict(50, decoded, 0);
    expect(evicted).not.toContain(50);
    expect(new Set(evicted)).toEqual(new Set([0, 120, 239]));
  });

  it('com teto negativo se comporta como teto zero', () => {
    expect(new Set(framesToEvict(50, [0, 50, 239], -5))).toEqual(new Set([0, 239]));
  });

  it('não despeja nada quando o teto é maior que o cache', () => {
    expect(framesToEvict(50, [0, 50, 239], 1000)).toEqual([]);
  });

  it('despeja por distância mesmo quando o playhead não está decodificado', () => {
    // Acontece de verdade: no conjunto mobile o arquivo do playhead pode ainda
    // não ter chegado quando o teto já estourou.
    expect(framesToEvict(500, [0, 50, 239], 1)).toEqual([0, 50]);
  });

  it('deixa o cache exatamente no teto e sempre com os mais próximos', () => {
    const decoded = [0, 12, 40, 55, 58, 61, 90, 130, 200, 239];
    const playhead = 58;
    const maxDecoded = 4;
    const evicted = framesToEvict(playhead, decoded, maxDecoded);
    const kept = decoded.filter((f) => !evicted.includes(f));

    expect(kept).toHaveLength(maxDecoded);
    expect(kept).toContain(playhead);
    const farthestKept = Math.max(...kept.map((f) => Math.abs(f - playhead)));
    const nearestEvicted = Math.min(...evicted.map((f) => Math.abs(f - playhead)));
    expect(farthestKept).toBeLessThanOrEqual(nearestEvicted);
  });

  it('nunca deixa o cache acima do teto, em qualquer posição do playhead', () => {
    const decoded = range(0, 99);
    for (const playhead of [0, 1, 37, 50, 98, 99]) {
      for (const maxDecoded of [0, 1, 7, 50, 99, 100]) {
        const evicted = framesToEvict(playhead, decoded, maxDecoded);
        const remaining = decoded.length - evicted.length;
        // O frame em tela é intocável, então o piso do cache é 1.
        expect(remaining).toBe(Math.max(maxDecoded, 1));
        expect(evicted).not.toContain(playhead);
        expect(new Set(evicted).size).toBe(evicted.length);
      }
    }
  });
});

describe('decodeWindowRadius', () => {
  it('mantém a janela de decode dentro do teto de despejo', () => {
    // Se a janela pedir mais arquivos do que o teto aceita, o pump decodifica
    // a borda e o despejo fecha a borda em ciclo, gastando CPU com a página
    // parada.
    for (let maxDecoded = 1; maxDecoded <= 200; maxDecoded += 1) {
      const filesInWindow = 2 * decodeWindowRadius(maxDecoded) + 1;
      expect(filesInWindow).toBeLessThanOrEqual(maxDecoded);
    }
  });

  it('usa o maior raio que ainda cabe', () => {
    for (let maxDecoded = 1; maxDecoded <= 200; maxDecoded += 1) {
      const oneMore = 2 * (decodeWindowRadius(maxDecoded) + 1) + 1;
      expect(oneMore).toBeGreaterThan(maxDecoded);
    }
  });

  it('não produz raio negativo com teto zero', () => {
    expect(decodeWindowRadius(0)).toBe(0);
    expect(decodeWindowRadius(-10)).toBe(0);
  });

  it('a janela cheia de cada conjunto não dispara despejo nenhum', () => {
    for (const [name, maxDecoded] of Object.entries(CINEMATIC.cache.maxDecoded)) {
      const radius = decodeWindowRadius(maxDecoded);
      const playhead = 60;
      const window = range(playhead - radius, playhead + radius);
      expect(framesToEvict(playhead, window, maxDecoded), name).toEqual([]);
    }
  });
});

describe('nearestLoadedFrame: empate e ordem de entrada', () => {
  it('resolve o empate pelo menor índice, venha a lista na ordem que vier', () => {
    expect(nearestLoadedFrame(30, [20, 40])).toBe(20);
    expect(nearestLoadedFrame(30, [40, 20])).toBe(20);
    expect(nearestLoadedFrame(30, [40, 20, 40, 20])).toBe(20);
  });

  it('devolve sempre um frame que estava na lista', () => {
    const loaded = [3, 3, 17, 17, 200];
    for (const target of [-50, 0, 10, 17, 100, 500]) {
      const nearest = nearestLoadedFrame(target, loaded);
      expect(nearest).not.toBeNull();
      expect(loaded).toContain(nearest);
    }
  });

  it('funciona com um item só e com alvo fora da faixa', () => {
    expect(nearestLoadedFrame(999, [42])).toBe(42);
    expect(nearestLoadedFrame(-999, [42])).toBe(42);
  });

  it('escolhe o mais próximo numa lista fora de ordem', () => {
    expect(nearestLoadedFrame(100, [239, 0, 97, 150, 30])).toBe(97);
  });
});

describe('buildLoadPriority com opções degeneradas', () => {
  it('cobre a sequência inteira mesmo sem cabeça e sem vizinhança', () => {
    const order = buildLoadPriority(120, new Set(), { ...OPTS, headCount: 0, lookAround: 0 });
    expect(order).toHaveLength(240);
    expect(new Set(order).size).toBe(240);
    expect(order[0]).toBe(0);
    expect(order[1]).toBe(239);
  });

  it('não pede nada fora da sequência quando o playhead está fora dela', () => {
    for (const playhead of [-500, 500]) {
      const order = buildLoadPriority(playhead, new Set(), OPTS);
      expect(order).toHaveLength(240);
      expect(Math.min(...order)).toBe(0);
      expect(Math.max(...order)).toBe(239);
    }
  });

  it('não pede frame nenhum quando o playhead é NaN', () => {
    // Um NaN na fila viraria um GET de `frame-0NaN.webp`.
    const order = buildLoadPriority(Number.NaN, new Set(), OPTS);
    expect(order.some((frame) => Number.isNaN(frame))).toBe(false);
    expect(order).toHaveLength(240);
    expect(new Set(order).size).toBe(240);
  });

  it('ignora um finalFrame que não existe no conjunto', () => {
    const order = buildLoadPriority(0, new Set(), { ...OPTS, finalFrame: 999 });
    expect(order).toHaveLength(240);
    expect(order[0]).toBe(0);
    expect(order).not.toContain(999);
  });

  it('atende uma sequência de um frame só', () => {
    expect(buildLoadPriority(0, new Set(), { frameCount: 1, finalFrame: 0, headCount: 30, lookAround: 24 })).toEqual([0]);
  });

  it('pede o lado de baixar antes do lado de subir, a cada passo da vizinhança', () => {
    // O scroll pode inverter, mas o sentido provável é para frente.
    const order = buildLoadPriority(120, new Set(), OPTS);
    for (let offset = 1; offset <= OPTS.lookAround; offset += 1) {
      expect(order.indexOf(120 + offset), `offset ${offset}`).toBeLessThan(order.indexOf(120 - offset));
    }
  });

  it('esgota a vizinhança inteira antes de qualquer frame distante', () => {
    const order = buildLoadPriority(200, new Set(), OPTS);
    const near = range(200 - OPTS.lookAround, 200 + OPTS.lookAround);
    const far = range(OPTS.headCount + 1, 200 - OPTS.lookAround - 1);

    const lastNear = Math.max(...near.map((f) => order.indexOf(f)));
    const firstFar = Math.min(...far.map((f) => order.indexOf(f)));
    expect(lastNear).toBeLessThan(firstFar);
  });

  it('a cabeça vem antes da vizinhança, porque é ela que segura o primeiro paint', () => {
    const order = buildLoadPriority(200, new Set(), OPTS);
    const lastHead = Math.max(...range(1, OPTS.headCount).map((f) => order.indexOf(f)));
    expect(lastHead).toBeLessThan(order.indexOf(200));
  });
});
