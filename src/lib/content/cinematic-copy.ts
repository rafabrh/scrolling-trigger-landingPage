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
    'SHK Group: agentes de IA, software e produtos digitais para empresas que vendem no WhatsApp e Instagram.',

  sharknews: {
    eyebrow: 'SharkNews',
    headline: ['O que importa em tecnologia,', 'antes do seu dia começar.'],
    support:
      'Tecnologia, IA e inovação, curadas diariamente às 07h07. Cinco minutos, grátis, um clique pra sair.',
    ctaLabel: 'Receber SharkNews',
    ctaHref: whatsappHref('cinematic-sharknews'),
    meta: 'DIÁRIO 07:07',
  },
  aiAgent: {
    eyebrow: 'AI Agent',
    headline: ['Cada canal responde,', 'a qualquer hora.'],
    support:
      'Agente de IA no WhatsApp e Instagram que responde, qualifica e conduz cada oportunidade até o fechamento.',
    ctaLabel: 'Conhecer AI Agent',
    ctaHref: whatsappHref('cinematic-aiagent'),
    meta: 'WHATSAPP + INSTAGRAM',
  },
} as const;
