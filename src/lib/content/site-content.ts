export const WHATSAPP_URL = 'https://wa.me/5511912839594';
export const INSTAGRAM_URL = 'https://instagram.com/shkgroup.ia';

/**
 * Link de WhatsApp com a posição de origem no `text`. O wa.me pré-preenche o
 * rascunho da conversa com esse texto, e o WhatsApp o preserva até o usuário
 * enviar — então a etiqueta `[via: posição]` chega na caixa de entrada e a
 * conversão fica contável por ponto de saída, sem pixel, sem cookie e sem nada
 * a declarar de LGPD. Dez âncoras que antes eram indistinguíveis passam a dizer
 * de onde vieram. O usuário pode apagar a linha antes de enviar; o custo de
 * errar para menos é só perder a contagem daquele clique.
 */
export function whatsappHref(position: string): string {
  const text = `Hi SHK Group! I came from the site and I'd like to talk. [via: ${position}]`;
  return `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
}

/**
 * Toda copy visível do site vive aqui. Nenhuma string hardcodada em
 * componente: a revisão de texto acontece em um arquivo só, e trocar de
 * idioma depois não exige tocar em componente nenhum.
 *
 * Nada aqui afirma número que não dê para sustentar. Casos, clientes,
 * métricas e depoimentos ficam de fora até existir material verificável.
 */
export const SITE_CONTENT = {
  brand: { name: 'SHK GROUP', logoAlt: '' },

  /**
   * O h1 da pagina. Fica visualmente oculto porque a abertura e uma cena
   * cinematografica sem texto, por decisao de design, mas a pagina precisa
   * declarar do que trata para leitor de tela e para indexacao. Sem ele o
   * documento tem oito h2 e nenhum h1.
   */
  pageHeading:
    'SHK Group: AI agents, software and digital products for companies that sell on WhatsApp and Instagram.',

  nav: [
    { label: 'Products', href: '#products' },
    { label: 'Technology', href: '#technology' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  cta: { label: 'Activate AI Agent', href: whatsappHref('header') },

  cinematic: {
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
  },

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
    copyright: `© ${new Date().getFullYear()} SHK GROUP`,
    links: [
      { label: 'Instagram', href: INSTAGRAM_URL },
      { label: 'WhatsApp', href: whatsappHref('footer') },
      // Rota interna: o SiteFooter abre este na mesma aba (sem target=_blank).
      { label: 'Privacy', href: '/privacy' },
    ],
  },
} as const;
