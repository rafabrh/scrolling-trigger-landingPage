import { describe, it, expect } from 'vitest';
import {
  buildLoadPriority,
  nearestLoadedFrame,
  framesToEvict,
  isCacheSettled,
} from '@/lib/cinematic/load-policy';

const range = (n: number) => new Set(Array.from({ length: n }, (_, i) => i));

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

  it('com a cauda travada, inclui só âncora, cabeça e a janela do playhead', () => {
    const order = buildLoadPriority(0, new Set(), { ...OPTS, tailUnlocked: false });
    // Urgentes presentes: os dois âncora, a cabeça e a janela ao redor do 0.
    expect(order).toContain(0);
    expect(order).toContain(239);
    expect(order).toContain(15); // cabeça (1..30)
    expect(order).toContain(24); // borda da janela (lookAround=24)
    // Cauda distante ausente: em playhead 0, o 150 não pode aparecer.
    expect(order).not.toContain(150);
  });

  it('com a cauda travada, é bem menor que 240 e sem repetição', () => {
    const order = buildLoadPriority(0, new Set(), { ...OPTS, tailUnlocked: false });
    expect(order.length).toBeLessThan(240);
    expect(new Set(order).size).toBe(order.length);
  });

  it('omitir tailUnlocked mantém a cobertura de 240 (default liberado)', () => {
    const order = buildLoadPriority(120, new Set(), OPTS);
    expect(order).toHaveLength(240);
    expect(buildLoadPriority(120, new Set(), { ...OPTS, tailUnlocked: true })).toHaveLength(240);
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

describe('isCacheSettled', () => {
  const NONE = new Set<number>();

  it('tudo baixado e janela decodificada -> true', () => {
    // 10 arquivos, todos baixados; janela do playhead (2..6) decodificada.
    const encoded = range(10);
    const decoded = new Set([2, 3, 4, 5, 6]);
    expect(isCacheSettled(4, 2, 10, encoded, decoded, NONE)).toBe(true);
  });

  it('um fetch pendente (não baixado, não abandonado) -> false', () => {
    const encoded = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]); // falta o 9
    const decoded = new Set([2, 3, 4, 5, 6]);
    expect(isCacheSettled(4, 2, 10, encoded, decoded, NONE)).toBe(false);
  });

  it('um arquivo da janela não decodificado -> false', () => {
    const encoded = range(10);
    const decoded = new Set([2, 3, 5, 6]); // falta o 4, sob o playhead
    expect(isCacheSettled(4, 2, 10, encoded, decoded, NONE)).toBe(false);
  });

  it('abandonado na janela não bloqueia settled -> true', () => {
    const encoded = new Set([0, 1, 2, 3, 5, 6, 7, 8, 9]); // 4 nunca baixou
    const decoded = new Set([2, 3, 5, 6]); // 4 nunca decodifica
    const abandoned = new Set([4]);
    expect(isCacheSettled(4, 2, 10, encoded, decoded, abandoned)).toBe(true);
  });

  it('janela presa na borda inicial (playFile perto de 0)', () => {
    const encoded = range(10);
    // playFile 0, raio 2 -> janela real 0..2.
    const decoded = new Set([0, 1, 2]);
    expect(isCacheSettled(0, 2, 10, encoded, decoded, NONE)).toBe(true);
    // faltando o 2 na janela recortada -> false.
    expect(isCacheSettled(0, 2, 10, encoded, new Set([0, 1]), NONE)).toBe(false);
  });

  it('janela presa na borda final (playFile perto de totalFiles-1)', () => {
    const encoded = range(10);
    // playFile 9, raio 2 -> janela real 7..9.
    const decoded = new Set([7, 8, 9]);
    expect(isCacheSettled(9, 2, 10, encoded, decoded, NONE)).toBe(true);
    expect(isCacheSettled(9, 2, 10, encoded, new Set([8, 9]), NONE)).toBe(false);
  });

  it('sequência inteira abandonada conta como busca completa', () => {
    const abandoned = range(10);
    // nada baixado, nada decodificado, mas tudo abandonado: sem trabalho.
    expect(isCacheSettled(4, 2, 10, NONE, NONE, abandoned)).toBe(true);
  });

  it('totalFiles <= 0 é trivialmente settled', () => {
    expect(isCacheSettled(0, 2, 0, NONE, NONE, NONE)).toBe(true);
  });

  it('aceita Map como fonte de has (sem alocar Set)', () => {
    const encoded = new Map<number, unknown>(Array.from({ length: 10 }, (_, i) => [i, {}]));
    const decoded = new Map<number, unknown>([2, 3, 4, 5, 6].map((i) => [i, {}]));
    expect(isCacheSettled(4, 2, 10, encoded, decoded, NONE)).toBe(true);
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
