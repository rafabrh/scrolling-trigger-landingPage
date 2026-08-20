import { describe, it, expect } from 'vitest';
import {
  resolveCinematicMode,
  resolveFrameSet,
  readEnvironmentSignals,
  MOBILE_BREAKPOINT_PX,
  type EnvironmentSignals,
} from '@/lib/env/device';

const base: EnvironmentSignals = {
  viewportWidth: 1440,
  prefersReducedMotion: false,
  saveData: false,
  effectiveType: '4g',
  deviceMemoryGb: 8,
};

describe('resolveCinematicMode: precedência com vários sinais ligados', () => {
  it('a preferência de movimento ganha de todos os outros sinais juntos', () => {
    expect(
      resolveCinematicMode({
        ...base,
        prefersReducedMotion: true,
        saveData: true,
        effectiveType: 'slow-2g',
        deviceMemoryGb: 0.5,
      }),
    ).toBe('reduced');
  });

  it('sem preferência de movimento, qualquer sinal de custo derruba para static', () => {
    expect(
      resolveCinematicMode({ ...base, saveData: true, effectiveType: '2g', deviceMemoryGb: 1 }),
    ).toBe('static');
    expect(resolveCinematicMode({ ...base, effectiveType: '3g', deviceMemoryGb: 1 })).toBe('static');
  });
});

describe('resolveCinematicMode: fronteira de memória', () => {
  it('2 GB ainda roda a experiência completa', () => {
    expect(resolveCinematicMode({ ...base, deviceMemoryGb: 2 })).toBe('full');
  });

  it('logo abaixo de 2 GB cai para static', () => {
    expect(resolveCinematicMode({ ...base, deviceMemoryGb: 1.99 })).toBe('static');
    expect(resolveCinematicMode({ ...base, deviceMemoryGb: 0 })).toBe('static');
  });

  it('memória alta não compensa conexão lenta', () => {
    expect(resolveCinematicMode({ ...base, deviceMemoryGb: 32, effectiveType: '2g' })).toBe('static');
  });
});

describe('resolveCinematicMode: tipos de conexão', () => {
  it('mantém full nas conexões rápidas e nas desconhecidas', () => {
    for (const effectiveType of ['4g', '5g', 'wifi', 'unknown', '']) {
      expect(resolveCinematicMode({ ...base, effectiveType }), effectiveType).toBe('full');
    }
  });

  it('a lista de conexões lentas é a da API, em minúsculas', () => {
    // A Network Information API só emite slow-2g, 2g, 3g e 4g. Um valor com
    // caixa diferente vem de outra fonte e não deve cortar a experiência.
    expect(resolveCinematicMode({ ...base, effectiveType: '2G' })).toBe('full');
  });
});

describe('resolveFrameSet nas pontas', () => {
  it('largura zero ainda escolhe um conjunto', () => {
    expect(resolveFrameSet({ ...base, viewportWidth: 0 })).toBe('mobile');
  });

  it('a fronteira é estrita: 767 é mobile, 768 é desktop', () => {
    expect(resolveFrameSet({ ...base, viewportWidth: MOBILE_BREAKPOINT_PX - 0.5 })).toBe('mobile');
    expect(resolveFrameSet({ ...base, viewportWidth: MOBILE_BREAKPOINT_PX + 0.5 })).toBe('desktop');
  });
});

describe('readEnvironmentSignals', () => {
  it('falha alto quando é chamado no servidor', () => {
    // Melhor estourar no build do que devolver sinais inventados e servir a
    // sequência inteira para quem pediu para não recebê-la.
    expect(typeof window).toBe('undefined');
    expect(() => readEnvironmentSignals()).toThrow(/browser/);
  });
});
