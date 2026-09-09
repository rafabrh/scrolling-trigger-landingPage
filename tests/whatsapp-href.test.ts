import { describe, it, expect } from 'vitest';
import { whatsappHref, WHATSAPP_URL, SITE_CONTENT } from '@/lib/content/site-content';

describe('whatsappHref', () => {
  it('aponta para o número de WhatsApp do site', () => {
    expect(whatsappHref('header').startsWith(`${WHATSAPP_URL}?text=`)).toBe(true);
  });

  it('carrega a posição codificada no text', () => {
    const url = whatsappHref('contact');
    const text = new URL(url).searchParams.get('text');
    expect(text).toContain('[via: contact]');
  });

  it('escapa o text para uma query válida', () => {
    // O text tem espaços e colchetes; sem encode o wa.me truncaria a mensagem.
    const url = whatsappHref('cinematic-aiagent');
    expect(url).not.toContain(' ');
    expect(() => new URL(url)).not.toThrow();
  });

  it('produz uma posição distinta por ponto de saída', () => {
    const positions = ['header', 'contact', 'footer', 'product-sharknews'];
    const texts = positions.map((p) => new URL(whatsappHref(p)).searchParams.get('text'));
    expect(new Set(texts).size).toBe(positions.length);
  });
});

describe('CTAs de WhatsApp no conteúdo', () => {
  it('cada CTA leva a etiqueta via: da sua posição', () => {
    const whatsappHrefs = [
      SITE_CONTENT.cta.href,
      SITE_CONTENT.cinematic.aiAgent.ctaHref,
      SITE_CONTENT.contact.ctaHref,
      SITE_CONTENT.footer.links[1].href,
    ];
    for (const href of whatsappHrefs) {
      const text = new URL(href).searchParams.get('text');
      expect(text).toContain('[via: ');
    }
    // Nenhuma âncora ficou sem posição: todos os text são únicos.
    const texts = whatsappHrefs.map((h) => new URL(h).searchParams.get('text'));
    expect(new Set(texts).size).toBe(whatsappHrefs.length);

    // SharkNews cinematic CTA aponta pra secao dedicada, nao pro WhatsApp
    expect(SITE_CONTENT.cinematic.sharknews.ctaHref).toBe('#sharknews');
  });
});
