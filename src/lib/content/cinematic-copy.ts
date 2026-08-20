import { whatsappHref } from './whatsapp';

/**
 * A fatia de copy que a ilha cinematic (client component) precisa, isolada do
 * resto do deck. Antes, `CinematicExperience` importava `SITE_CONTENT` inteiro:
 * como é a única parte cliente que lê copy, isso arrastava products, technology,
 * about, cases, contact, nav e footer — texto que só o servidor renderiza — para
 * dentro do bundle do JavaScript. Aqui vai só o h1 e as duas cenas com overlay;
 * o servidor continua lendo tudo por `SITE_CONTENT`, que reexporta estes mesmos
 * objetos, mantendo uma fonte única.
 */
export const CINEMATIC_COPY = {
  /**
   * O h1 da página. Fica visualmente oculto porque a abertura é uma cena
   * cinematográfica sem texto, por decisão de design, mas a página precisa
   * declarar do que trata para leitor de tela e para indexação.
   */
  pageHeading:
    'SHK Group: AI agents, software and digital products for companies that sell on WhatsApp and Instagram.',

  sharknews: {
    eyebrow: 'SharkNews',
    headline: ['What matters in technology,', 'before your day begins.'],
    support:
      'Technology, AI and innovation, curated daily at 07:07. Five minutes, free, one click to leave.',
    ctaLabel: 'Get SharkNews',
    ctaHref: whatsappHref('cinematic-sharknews'),
    meta: 'DAILY 07:07',
  },
  aiAgent: {
    eyebrow: 'AI Agent',
    headline: ['Conversations that move', 'toward conversion.'],
    support:
      'AI that responds, qualifies, automates and advances every opportunity on WhatsApp and Instagram.',
    ctaLabel: 'Explore AI Agent',
    ctaHref: whatsappHref('cinematic-aiagent'),
    meta: 'WHATSAPP + INSTAGRAM',
  },
} as const;
