import { describe, it, expect } from 'vitest';
import { PLANS } from '@/lib/content/plans-content';

describe('PLANS', () => {
  it('tem exatamente 3 planos', () => {
    expect(PLANS).toHaveLength(3);
  });

  it('preços são R$99,90 / R$197,90 / R$547,90', () => {
    expect(PLANS.map((p) => p.price)).toEqual([
      'R$99,90',
      'R$197,90',
      'R$547,90',
    ]);
  });
});
