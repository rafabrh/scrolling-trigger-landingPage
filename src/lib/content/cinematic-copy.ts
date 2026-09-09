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
    headline: ['A newsletter de quem', 'constrói com tecnologia.'],
    support:
      'Arquitetura de software, oficina de agentes de IA com Claude Code e as notícias que movem o mercado tech. Toda segunda e sexta na sua caixa de entrada.',
    meta: 'SEGUNDAS & SEXTAS  ·  GRÁTIS PRA SEMPRE',
  },
  aiAgent: {
    eyebrow: 'AI Agent',
    headline: ['Seu próximo vendedor', 'nunca dorme.'],
    support:
      'Um agente de IA no WhatsApp e Instagram que atende cada lead em segundos, qualifica, contorna objeções e conduz até o fechamento. 24 horas por dia, 7 dias por semana.',
    meta: 'WHATSAPP + INSTAGRAM  ·  ATIVAÇÃO EM 48H',
  },
} as const;
