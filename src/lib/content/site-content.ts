// Helpers de WhatsApp vivem em módulo próprio para a ilha cinematic (cliente)
// poder importá-los sem arrastar este deck de copy inteiro. Reexportados aqui
// para os consumidores de servidor que já os importam deste arquivo.
export { WHATSAPP_URL, INSTAGRAM_URL, whatsappHref } from './whatsapp';

import { INSTAGRAM_URL, whatsappHref } from './whatsapp';
import { CINEMATIC_COPY } from './cinematic-copy';

/**
 * Ano do rodapé fixado, e não `new Date().getFullYear()`. A página é
 * pré-renderizada estática: `new Date()` gravava o ano da máquina de build no
 * HTML, então dois builds em lados opostos do réveillon divergiam sem ninguém
 * mudar nada. Constante é determinístico; sobe junto num release.
 */
const COPYRIGHT_YEAR = 2026;

/**
 * Toda copy visível do site vive aqui. Nenhuma string hardcodada em
 * componente: a revisão de texto acontece em um arquivo só, e trocar de
 * idioma depois não exige tocar em componente nenhum.
 *
 * Nada aqui afirma número que não dê para sustentar. Casos, clientes,
 * métricas e depoimentos ficam de fora até existir material verificável.
 */
export const SITE_CONTENT = {
  brand: { name: 'SHK GROUP' },

  // Reexporta o h1 do slice do cinematic para manter uma fonte única: a ilha
  // cliente e o servidor leem o mesmo texto.
  pageHeading: CINEMATIC_COPY.pageHeading,

  nav: [
    { label: 'Products', href: '#products' },
    { label: 'Technology', href: '#technology' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  cta: { label: 'Activate AI Agent', href: whatsappHref('header') },

  // Mesmo objeto que a ilha cliente importa direto de `cinematic-copy`. Fica
  // aqui reexportado para os consumidores de servidor e para os testes.
  cinematic: CINEMATIC_COPY,

  intro: {
    eyebrow: 'Who we are',
    headline: 'Technology that changes how a business sells.',
    body: 'SHK Group builds AI agents, software and digital products for companies whose sales operation runs slower than their demand. We work as a partner inside the operation, not as a vendor at the edge of it.',
    pillars: [
      { index: '01', label: 'AI & Automation' },
      { index: '02', label: 'Software' },
      { index: '03', label: 'Digital Products' },
    ],
    meta: '48H Activation',
  },

  products: {
    eyebrow: 'Products',
    headline: 'Two products. One operation.',
    support:
      'One keeps you ahead of what is happening. The other keeps every channel answering at any hour.',
    items: [
      {
        id: 'sharknews',
        eyebrow: 'SharkNews',
        badge: '07:07',
        headline: 'The technology briefing that arrives before your day.',
        body: 'Curated technology, AI and innovation news. Five minutes of reading, delivered daily.',
        points: ['Free, forever', 'No spam', 'One click to leave'],
        ctaLabel: 'Get SharkNews',
        ctaHref: whatsappHref('product-sharknews'),
      },
      {
        id: 'ai-agent',
        eyebrow: 'AI Agent',
        badge: '48H ACTIVATION',
        headline: 'Every channel answers, at any hour.',
        body: 'An agent on WhatsApp and Instagram that responds, qualifies leads and carries the conversation to the close.',
        points: [
          'Reads audio, images and comments',
          'Payment links, Pix and scheduling',
          'Remembers every conversation',
        ],
        ctaLabel: 'Explore AI Agent',
        ctaHref: whatsappHref('product-ai-agent'),
      },
    ],
  },

  technology: {
    eyebrow: 'Technology',
    headline: 'What the agent actually does.',
    support:
      'Capabilities available on WhatsApp Business and Instagram, configured per operation.',
    capabilities: [
      'Responds in seconds, at any hour',
      'Qualifies leads automatically',
      'Carries the conversation through the funnel',
      'Transcribes audio messages',
      'Reads and answers Instagram comments',
      'Moves comment threads into Direct',
      'Generates payment links and Pix codes',
      'Books appointments',
      'Saves contacts into CRM or spreadsheet',
      'Keeps the context of a conversation across sessions',
      'Hands over to a person when the conversation calls for it',
    ],
  },

  about: {
    eyebrow: 'About',
    headline: 'A partner inside the operation.',
    body: 'SHK Group combines artificial intelligence, software development and digital products. The work starts at the channel where the customer already is, and moves outward from there.',
    notes: [
      {
        title: 'Implementation in days',
        body: 'An agent goes live within 48 hours of the channel and funnel being defined.',
      },
      {
        title: 'One connected stack',
        body: 'AI, software and marketing built by the same team, so nothing gets lost between vendors.',
      },
    ],
  },

  cases: {
    eyebrow: 'Cases',
    headline: 'Results, once they can be shown.',
    // Placeholder deliberado. Nenhum caso, cliente ou número entra aqui sem
    // material verificável. Ver seção 16 da spec.
    placeholder:
      'This section is reserved for client work with published, verifiable results. Nothing is listed here yet.',
  },

  contact: {
    eyebrow: 'Contact',
    headline: 'Start the conversation on WhatsApp.',
    body: 'Tell us which channel you sell on and what the operation looks like today. We answer on WhatsApp.',
    ctaLabel: 'Talk on WhatsApp',
    ctaHref: whatsappHref('contact'),
    instagramLabel: '@shkgroup.ia',
    instagramHref: INSTAGRAM_URL,
  },

  footer: {
    copyright: `© ${COPYRIGHT_YEAR} SHK GROUP`,
    links: [
      { label: 'Instagram', href: INSTAGRAM_URL },
      { label: 'WhatsApp', href: whatsappHref('footer') },
      // Rota interna: o SiteFooter abre este na mesma aba (sem target=_blank).
      { label: 'Privacy', href: '/privacy' },
    ],
  },
} as const;
