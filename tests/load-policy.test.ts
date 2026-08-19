import { describe, it, expect } from 'vitest';
import { buildLoadPriority, nearestLoadedFrame, framesToEvict } from '@/lib/cinematic/load-policy';

const OPTS = { frameCount: 240, finalFrame: 239, headCount: 30, lookAround: 24 };

describe('buildLoadPriority', () => {
  it('pede o primeiro frame antes de tudo', () => {
    expect(buildLoadPriority(0, new Set(), OPTS)[0]).toBe(0);
  });

  it('pede o frame final logo depois do primeiro', () => {
    expect(buildLoadPriority(0, new Set(), OPTS)[1]).toBe(239);
  });

  it('cobre todos os frames exatamente uma vez', () => {
    const order = buildLoadPriority(120, new Set(), OPTS);
    expect(order).toHaveLength(240);
    expect(new Set(order).size).toBe(240);
  });

  it('não repete índice quando o playhead cai dentro da cabeça', () => {
    const order = buildLoadPriority(10, new Set(), OPTS);
    expect(new Set(order).size).toBe(order.length);
  });

  it('omite o que já está carregado', () => {
    const loaded = new Set([0, 239, 120]);
    const order = buildLoadPriority(120, loaded, OPTS);
    expect(order).toHaveLength(237);
    for (const f of loaded) expect(order).not.toContain(f);
  });

  it('põe a vizinhança do playhead antes do resto da sequência', () => {
    const loaded = new Set<number>([0, 239]);
    const order = buildLoadPriority(200, loaded, OPTS);
    const near = order.indexOf(201);
    const far = order.indexOf(150);
    expect(near).toBeGreaterThanOrEqual(0);
    expect(near).toBeLessThan(far);
  });

  it('devolve lista vazia quando tudo já está carregado', () => {
    const loaded = new Set(Array.from({ length: 240 }, (_, i) => i));
    expect(buildLoadPriority(0, loaded, OPTS)).toEqual([]);
  });
});

describe('nearestLoadedFrame', () => {
  it('devolve o próprio alvo quando ele está carregado', () => {
    expect(nearestLoadedFrame(50, [10, 50, 90])).toBe(50);
  });
  it('acha o mais próximo abaixo', () => {
    expect(nearestLoadedFrame(88, [10, 50, 90])).toBe(90);
  });
  it('acha o mais próximo acima', () => {
    expect(nearestLoadedFrame(12, [10, 50, 90])).toBe(10);
  });
  it('resolve empate pelo menor índice', () => {
    expect(nearestLoadedFrame(30, [20, 40])).toBe(20);
  });
  it('devolve null quando não há nada carregado', () => {
    expect(nearestLoadedFrame(30, [])).toBeNull();
  });
});

describe('framesToEvict', () => {
  it('não despeja nada abaixo do teto', () => {
    expect(framesToEvict(50, [48, 49, 50, 51], 10)).toEqual([]);
  });

  it('despeja o mais distante do playhead primeiro', () => {
    const evicted = framesToEvict(50, [0, 49, 50, 51, 239], 3);
    expect(evicted).toEqual([239, 0]);
  });

  it('nunca despeja o frame sob o playhead', () => {
    const evicted = framesToEvict(50, [0, 50, 239], 1);
    expect(evicted).not.toContain(50);
    expect(evicted).toHaveLength(2);
  });

  it('respeita o teto exatamente', () => {
    const decoded = Array.from({ length: 100 }, (_, i) => i);
    const evicted = framesToEvict(50, decoded, 40);
    expect(decoded.length - evicted.length).toBe(40);
  });

  it('aceita lista vazia', () => {
    expect(framesToEvict(50, [], 10)).toEqual([]);
  });
});
