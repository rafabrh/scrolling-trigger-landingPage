import { describe, it, expect } from 'vitest';
import {
  resolveCinematicMode,
  resolveFrameSet,
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

describe('resolveCinematicMode', () => {
  it('entrega a experiência completa num desktop comum', () => {
    expect(resolveCinematicMode(base)).toBe('full');
  });

  it('cai para reduced quando o usuário pede menos movimento', () => {
    expect(resolveCinematicMode({ ...base, prefersReducedMotion: true })).toBe('reduced');
  });

  it('cai para static com economia de dados ligada', () => {
    expect(resolveCinematicMode({ ...base, saveData: true })).toBe('static');
  });

  it('cai para static em conexão lenta', () => {
    expect(resolveCinematicMode({ ...base, effectiveType: '2g' })).toBe('static');
    expect(resolveCinematicMode({ ...base, effectiveType: 'slow-2g' })).toBe('static');
    expect(resolveCinematicMode({ ...base, effectiveType: '3g' })).toBe('static');
  });

  it('cai para static em aparelho com pouca memória', () => {
    expect(resolveCinematicMode({ ...base, deviceMemoryGb: 1 })).toBe('static');
  });

  it('prioriza reduced sobre static, porque é escolha do usuário', () => {
    expect(resolveCinematicMode({ ...base, prefersReducedMotion: true, saveData: true })).toBe('reduced');
  });

  it('segue em full quando os sinais opcionais não existem', () => {
    expect(resolveCinematicMode({ ...base, effectiveType: null, deviceMemoryGb: null })).toBe('full');
  });
});

describe('resolveFrameSet', () => {
  it('usa o conjunto mobile abaixo do breakpoint', () => {
    expect(resolveFrameSet({ ...base, viewportWidth: MOBILE_BREAKPOINT_PX - 1 })).toBe('mobile');
    expect(resolveFrameSet({ ...base, viewportWidth: 390 })).toBe('mobile');
  });
  it('usa o conjunto desktop a partir do breakpoint', () => {
    expect(resolveFrameSet({ ...base, viewportWidth: MOBILE_BREAKPOINT_PX })).toBe('desktop');
    expect(resolveFrameSet({ ...base, viewportWidth: 2560 })).toBe('desktop');
  });
});
