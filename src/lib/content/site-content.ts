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
    { label: 'Produtos', href: '#products' },
    { label: 'Tecnologia', href: '#technology' },
    { label: 'Sobre', href: '#about' },
    { label: 'Contato', href: '#contact' },
  ],

  cta: { label: 'Ativar AI Agent', href: whatsappHref('header') },

  // Mesmo objeto que a ilha cliente importa direto de `cinematic-copy`. Fica
  // aqui reexportado para os consumidores de servidor e para os testes.
  cinematic: CINEMATIC_COPY,

  intro: {
    eyebrow: 'Quem somos',
    headline: 'Tecnologia que muda como uma empresa vende.',
    body: 'O SHK Group constrói agentes de IA, software e produtos digitais para empresas cuja operação de vendas não acompanha a demanda. Trabalhamos como parceiros dentro da operação, não como fornecedores na borda dela.',
    pillars: [
      { index: '01', label: 'IA & Automação' },
      { index: '02', label: 'Software' },
      { index: '03', label: 'Produtos Digitais' },
    ],
    meta: 'ATIVAÇÃO EM 48H',
  },

  products: {
    eyebrow: 'Produtos',
    headline: 'Dois produtos. Uma operação.',
    support:
      'Um mantém você à frente do que está acontecendo. O outro mantém cada canal respondendo a qualquer hora.',
    items: [
      {
        id: 'sharknews',
        eyebrow: 'SharkNews',
        badge: '07:07',
        headline: 'O briefing de tecnologia que chega antes do seu dia começar.',
        body: 'Tecnologia, IA e inovação curadas e entregues diariamente. Cinco minutos de leitura, todo dia, sem custo.',
        points: ['Gratuito, para sempre', 'Sem spam', 'Um clique pra sair'],
        ctaLabel: 'Receber SharkNews',
        ctaHref: whatsappHref('product-sharknews'),
      },
      {
        id: 'ai-agent',
        eyebrow: 'AI Agent',
        badge: 'ATIVAÇÃO 48H',
        headline: 'Cada canal respondendo, a qualquer hora.',
        body: 'Agente de IA no WhatsApp e Instagram que responde, qualifica leads e conduz cada conversa até o fechamento — sem pausa, sem perda de contexto.',
        points: [
          'Lê áudios, imagens e comentários',
          'Links de pagamento, Pix e agendamentos',
          'Mantém o contexto de cada conversa',
        ],
        ctaLabel: 'Conhecer AI Agent',
        ctaHref: whatsappHref('product-ai-agent'),
      },
    ],
  },

  technology: {
    eyebrow: 'Tecnologia',
    headline: 'O que o agente faz, de verdade.',
    support:
      'Capacidades disponíveis no WhatsApp Business e Instagram, configuradas por operação.',
    capabilities: [
      'Responde em segundos, a qualquer hora',
      'Qualifica leads automaticamente',
      'Conduz a conversa pelo funil inteiro',
      'Transcreve mensagens de áudio',
      'Lê e responde comentários no Instagram',
      'Move threads de comentário para o Direct',
      'Gera links de pagamento e códigos Pix',
      'Agenda atendimentos',
      'Salva contatos em CRM ou planilha',
      'Mantém o contexto da conversa entre sessões',
      'Transfere para uma pessoa quando a conversa exige',
    ],
  },

  about: {
    eyebrow: 'Sobre',
    headline: 'Um parceiro dentro da operação.',
    body: 'O SHK Group une inteligência artificial, desenvolvimento de software e produtos digitais. O trabalho começa no canal onde o cliente já está e se expande a partir daí.',
    notes: [
      {
        title: 'Implementação em dias',
        body: 'Um agente entra em produção em até 48 horas a partir da definição do canal e do funil.',
      },
      {
        title: 'Um stack conectado',
        body: 'IA, software e marketing construídos pelo mesmo time — nada se perde entre fornecedores.',
      },
    ],
    founder: {
      name: 'Rafael Alvarenga',
      role: 'Founder & CTO',
      linkedin: 'https://www.linkedin.com/in/rafabrh/',
      github: 'https://github.com/rafabrh',
    },
  },

  cases: {
    eyebrow: 'Cases',
    headline: 'Resultados, quando puderem ser mostrados.',
    // Placeholder deliberado. Nenhum caso, cliente ou número entra aqui sem
    // material verificável.
    placeholder:
      'Esta seção é reservada para trabalhos com resultados publicados e verificáveis. Nada está listado ainda.',
  },

  contact: {
    eyebrow: 'Contato',
    headline: 'Comece a conversa no WhatsApp.',
    body: 'Nos conte em qual canal você vende e como a operação está hoje. Respondemos no WhatsApp.',
    ctaLabel: 'Falar no WhatsApp',
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
      { label: 'Privacidade', href: '/privacy' },
    ],
  },
} as const;
