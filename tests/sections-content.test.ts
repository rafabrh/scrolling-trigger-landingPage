import { describe, it, expect } from 'vitest';
import { SITE_CONTENT } from '@/lib/content/site-content';

describe('SITE_CONTENT — integridade das seções', () => {
  it('possui todas as chaves obrigatórias', () => {
    const required = [
      'heroStats',
      'benefits',
      'process',
      'integration',
      'faq',
      'sharknewsSection',
      'ctaFinal',
    ] as const;

    for (const key of required) {
      expect(SITE_CONTENT).toHaveProperty(key);
    }
  });

  // ── heroStats ──
  it('heroStats tem exatamente 3 itens', () => {
    expect(SITE_CONTENT.heroStats).toHaveLength(3);
  });

  it('cada heroStat possui value e label', () => {
    for (const stat of SITE_CONTENT.heroStats) {
      expect(stat.value).toBeTruthy();
      expect(stat.label).toBeTruthy();
    }
  });

  // ── benefits ──
  it('benefits tem eyebrow, headline e 6 itens', () => {
    const { eyebrow, headline, items } = SITE_CONTENT.benefits;
    expect(eyebrow).toBeTruthy();
    expect(headline).toBeTruthy();
    expect(items).toHaveLength(6);
  });

  it('cada benefit possui title e body', () => {
    for (const item of SITE_CONTENT.benefits.items) {
      expect(item.title).toBeTruthy();
      expect(item.body).toBeTruthy();
    }
  });

  // ── process ──
  it('process tem eyebrow, headline e 4 steps', () => {
    const { eyebrow, headline, steps } = SITE_CONTENT.process;
    expect(eyebrow).toBeTruthy();
    expect(headline).toBeTruthy();
    expect(steps).toHaveLength(4);
  });

  it('cada step possui number, title e body', () => {
    for (const step of SITE_CONTENT.process.steps) {
      expect(step.number).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.body).toBeTruthy();
    }
  });

  // ── integration ──
  it('integration tem eyebrow, headline e 2 channels', () => {
    const { eyebrow, headline, channels } = SITE_CONTENT.integration;
    expect(eyebrow).toBeTruthy();
    expect(headline).toBeTruthy();
    expect(channels).toHaveLength(2);
  });

  it('cada channel possui name, method, detail e meta', () => {
    for (const ch of SITE_CONTENT.integration.channels) {
      expect(ch.name).toBeTruthy();
      expect(ch.method).toBeTruthy();
      expect(ch.detail).toBeTruthy();
      expect(ch.meta).toBeTruthy();
    }
  });

  // ── faq ──
  it('faq tem eyebrow, headline e 6 itens', () => {
    const { eyebrow, headline, items } = SITE_CONTENT.faq;
    expect(eyebrow).toBeTruthy();
    expect(headline).toBeTruthy();
    expect(items).toHaveLength(6);
  });

  it('cada faq possui question e answer', () => {
    for (const item of SITE_CONTENT.faq.items) {
      expect(item.question).toBeTruthy();
      expect(item.answer).toBeTruthy();
    }
  });

  // ── sharknewsSection ──
  it('sharknewsSection tem eyebrow e headline', () => {
    const { eyebrow, headline } = SITE_CONTENT.sharknewsSection;
    expect(eyebrow).toBeTruthy();
    expect(headline).toBeTruthy();
  });

  // ── ctaFinal ──
  it('ctaFinal tem headline, body e 2 ctas', () => {
    const { headline, body, ctas } = SITE_CONTENT.ctaFinal;
    expect(headline).toBeTruthy();
    expect(body).toBeTruthy();
    expect(ctas).toHaveLength(2);
  });

  it('cada cta possui label e href', () => {
    for (const cta of SITE_CONTENT.ctaFinal.ctas) {
      expect(cta.label).toBeTruthy();
      expect(cta.href).toBeTruthy();
    }
  });
});
