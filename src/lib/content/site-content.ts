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
    { label: 'Planos', href: '#plans' },
    { label: 'FAQ', href: '#faq' },
    { label: 'SharkNews', href: '#sharknews' },
    { label: 'Contato', href: '#contact' },
  ],

  cta: { label: 'Ativar AI Agent', href: whatsappHref('header') },

  heroStats: [
    { value: '24/7', label: 'Operação contínua' },
    { value: '~10s', label: 'Tempo de resposta' },
    { value: '100%', label: 'Leads capturados' },
  ],

  // Mesmo objeto que a ilha cliente importa direto de `cinematic-copy`. Fica
  // aqui reexportado para os consumidores de servidor e para os testes.
  cinematic: CINEMATIC_COPY,

  products: {
    eyebrow: 'O que fazemos',
    headline: 'Tráfego traz o lead. O agente fecha a venda.',
    support:
      'Campanhas de tráfego pago jogam leads quentes direto no WhatsApp. O Agente IA atende em segundos, qualifica e conduz até o fechamento — sem a sua equipe precisar levantar da cadeira.',
    items: [
      { id: 'trafego', name: 'Tráfego Pago', tagline: 'Campanhas que geram leads de verdade.', description: 'Meta Ads, Google Ads e estratégias de mídia paga focadas em trazer gente pronta pra comprar direto pro seu WhatsApp.' },
      { id: 'ai-agent', name: 'Agente IA', tagline: 'Atende, qualifica e fecha no WhatsApp.', description: 'Cada lead novo é atendido em segundos, 24/7. O agente responde, contorna objeções e conduz até o pagamento — sem intervenção humana.' },
      { id: 'sites', name: 'Sites', tagline: 'Presença digital que converte.', description: 'Landing pages e sites construídos pra converter visitante em lead qualificado.' },
      { id: 'integracoes', name: 'Integrações', tagline: 'Seus sistemas conversando entre si.', description: 'Conectamos CRM, ERP, planilhas e APIs pra sua operação funcionar sozinha.' },
      { id: 'identidade', name: 'Identidade', tagline: 'Marca que comunica sem precisar explicar.', description: 'Branding e identidade visual que posiciona sua marca no mercado.' },
      { id: 'sharknews', name: 'SharkNews', tagline: 'Newsletter de tech, arquitetura e IA.', description: 'Toda segunda e sexta: arquitetura de software, Claude Code, oficina de agentes e as notícias mais quentes do mercado.', href: '#sharknews' },
    ],
  },

  technology: {
    eyebrow: 'Tecnologia',
    headline: 'O que o agente faz, de verdade.',
    support:
      'Capacidades disponíveis no WhatsApp Business e Instagram, configuradas por operação.',
    capabilities: [
      { label: 'Responde com texto e imagens', detail: 'Envia respostas completas com textos formatados e imagens de produtos ou catálogos.' },
      { label: 'Entende áudios', detail: 'Transcreve e interpreta mensagens de voz, respondendo com precisão ao conteúdo.' },
      { label: 'Comentários para Direct', detail: 'No Instagram, interage com comentários e direciona o interessado para conversa privada.' },
      { label: 'Link de pagamento', detail: 'Gera e envia links de pagamento diretamente na conversa, eliminando etapas manuais.' },
      { label: 'QR Code Pix', detail: 'Disponibiliza QR Code para facilitar a conversão imediata dentro da conversa.' },
      { label: 'Agendamentos', detail: 'Agenda consultas, reuniões ou visitas automaticamente com base na disponibilidade.' },
      { label: 'Salva contatos', detail: 'Registra cada novo lead com nome, número e informações relevantes da conversa.' },
      { label: 'Organiza em CRM', detail: 'Exporta dados de cada lead para planilha Google ou CRM integrado automaticamente.' },
      { label: 'Presença humana', detail: 'Exibe "digitando" e "visualizado" para criar experiência natural e humana.' },
      { label: 'Memória de contexto', detail: 'Lembra de informações anteriores para respostas mais inteligentes e personalizadas.' },
    ],
  },

  about: {
    eyebrow: 'Quem somos',
    headline: 'Tecnologia que transforma operações comerciais.',
    body: 'A SHK GROUP.IA é uma empresa de soluções digitais que une inteligência artificial, marketing estratégico e desenvolvimento de software para empresas que precisam vender mais, atender melhor e operar com mais eficiência. Atuamos como parceiros de crescimento — da automação do atendimento à construção de sistemas completos — sempre com foco em resultado mensurável, velocidade de implantação e escalabilidade.',
    pillars: [
      { index: '01', label: 'Implantação ágil', detail: 'Resultados em dias, não meses.' },
      { index: '02', label: 'Confiança operacional', detail: 'Estruturas robustas e seguras.' },
      { index: '03', label: 'Ecossistema integrado', detail: 'IA, marketing e software conectados.' },
    ],
    metrics: [
      { value: 47, suffix: '+', label: 'Projetos entregues' },
      { value: 32, suffix: '+', label: 'Clientes ativos' },
      { value: 12, suffix: '', label: 'Empresas atendidas' },
      { value: 99.8, suffix: '%', label: 'Uptime de operação' },
      { value: 48, suffix: 'h', label: 'Ativação completa' },
    ],
    founders: [
      { name: 'Rafael Alvarenga', role: 'Founder & CTO' },
      { name: 'Victor Alves', role: 'CEO, Campeão Best Seller Mercado Livre 2026' },
    ],
  },

  cases: {
    eyebrow: 'Cases',
    headline: 'Resultados reais de quem já usa.',
    placeholder:
      'Esta seção é reservada para trabalhos com resultados publicados e verificáveis. Nada está listado ainda.',
  },

  plans: {
    eyebrow: 'Planos',
    headline: 'Escolha o plano certo para a sua operação.',
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

  benefits: {
    eyebrow: 'Por que ativar',
    headline: 'Benefícios que impactam diretamente seu faturamento.',
    items: [
      { title: 'Velocidade no atendimento', body: 'Respostas em até 10 segundos. Nenhum cliente fica sem atenção, independentemente do volume de mensagens.' },
      { title: 'Mais conversão', body: 'Leads atendidos com rapidez e estratégia convertem mais. O Agente IA conduz cada conversa com foco em resultado.' },
      { title: 'Menos esforço manual', body: 'Sua equipe deixa de responder perguntas repetitivas e passa a focar em tarefas estratégicas e de alto valor.' },
      { title: 'Atendimento consistente', body: 'O mesmo padrão de qualidade em cada conversa. Sem variações de humor, sem esquecimentos, sem falhas.' },
      { title: 'Captação e organização de leads', body: 'Cada contato é registrado, classificado e salvo automaticamente em planilha ou CRM, pronto para acompanhamento.' },
      { title: 'Escalabilidade operacional', body: 'Atenda 10 ou 10.000 conversas simultâneas sem contratar mais pessoas. O Agente IA escala junto com seu negócio.' },
    ],
  },

  process: {
    eyebrow: 'Processo',
    headline: 'Da contratação à operação em quatro passos.',
    steps: [
      { number: '01', title: 'Escolha do canal', body: 'Defina onde o Agente IA vai operar: WhatsApp Business ou Instagram comercial.' },
      { number: '02', title: 'Estruturação do funil', body: 'Montamos o fluxo de conversa, os gatilhos de qualificação e o caminho até o fechamento.' },
      { number: '03', title: 'Integração', body: 'Conectamos o Agente via QR Code (WhatsApp) ou Meta Developers (Instagram).' },
      { number: '04', title: 'Ativação em até 48h', body: 'Seu Agente IA entra em operação, pronto para atender, qualificar e vender no automático.' },
    ],
  },

  integration: {
    eyebrow: 'Integração',
    headline: 'Conexão simples, ativação sem burocracia.',
    channels: [
      { name: 'WhatsApp Business', method: 'QR Code', detail: 'Ativação rápida por QR Code. Basta escanear com seu WhatsApp Business e o Agente entra em operação imediatamente.', meta: 'QR Code · Ativação instantânea' },
      { name: 'Instagram Comercial', method: 'Meta API', detail: 'Integração via Meta Developers com orientação completa. Opera no Direct e nos comentários do seu perfil comercial.', meta: 'Meta API · Direct + Comentários' },
    ],
  },

  faq: {
    eyebrow: 'Perguntas Frequentes',
    headline: 'Tudo o que você precisa saber antes de ativar.',
    items: [
      { question: 'Em quais canais o Agente IA funciona?', answer: 'Atualmente, o Agente IA opera no WhatsApp Business e no Instagram comercial. A escolha do canal é definida na contratação do plano, e cada agente é configurado para um canal específico.' },
      { question: 'Qual é o prazo de ativação?', answer: 'O Agente IA é ativado em até 48 horas após a contratação. Esse prazo inclui a configuração do funil, a integração com o canal escolhido e os testes de operação.' },
      { question: 'O Agente IA responde sozinho, sem intervenção humana?', answer: 'Sim. O Agente IA opera de forma totalmente autônoma, seguindo o funil de vendas configurado. Ele responde, qualifica, contorna objeções e conduz até o fechamento. Quando necessário, pode direcionar o lead para atendimento humano.' },
      { question: 'O Agente IA pode enviar links de pagamento?', answer: 'Sim. O Agente pode enviar links de pagamento e QR Codes diretamente na conversa, permitindo que o cliente finalize a compra sem sair do chat.' },
      { question: 'Preciso de alguma estrutura técnica para usar?', answer: 'Não. Você só precisa de um WhatsApp Business ativo ou um perfil comercial no Instagram. Toda a configuração técnica é feita pela equipe da SHK GROUP.IA.' },
      { question: 'Posso contratar outros serviços além do Agente IA?', answer: 'Sim. A SHK GROUP.IA oferece um ecossistema completo: tráfego pago, criação de sites, desenvolvimento de software, social media e branding. Todos podem ser contratados separadamente ou combinados.' },
    ],
  },

  sharknewsSection: {
    eyebrow: 'SharkNews',
    headline: 'Arquitetura, IA e o que move o mercado tech.',
    support: 'Toda segunda e sexta na sua caixa de entrada. Soluções de arquitetura de software, oficina de agentes com Claude Code e as notícias mais quentes do mercado tech.',
    features: [
      'Arquitetura de software aplicada a problemas reais',
      'Ensinamentos práticos com Claude Code',
      'Oficina de agentes de IA — do conceito à produção',
      'As notícias mais quentes do mercado tech',
    ],
    meta: [
      { label: 'Segundas e sextas', detail: 'Duas edições por semana, direto no e-mail' },
      { label: 'Leitura rápida', detail: '5 minutos antes do café' },
      { label: 'Zero spam', detail: 'Cancele com um clique, sem complicação' },
    ],
    form: {
      namePlaceholder: 'Como posso te chamar?',
      emailPlaceholder: 'seuemail@exemplo.com',
      consentText: 'Aceito receber e-mails da SharkNews e concordo com a',
      consentLink: { label: 'Política de Privacidade', href: '/privacy' },
      submitLabel: 'Quero receber grátis',
      loadingLabel: 'Inscrevendo...',
      successTitle: 'Inscrição confirmada!',
      successBody: 'Você vai receber a próxima edição na segunda ou sexta.',
      errorBody: 'Algo deu errado. Tente novamente.',
      privacy: 'Seus dados estão protegidos. Sem spam, nunca.',
    },
  },

  ctaFinal: {
    headline: 'Sua empresa pode continuar perdendo vendas por atendimento lento. Ou pode evoluir agora.',
    body: 'Enquanto você responde manualmente, seus concorrentes estão automatizando. O Agente IA da SHK GROUP.IA transforma cada mensagem em uma oportunidade real de venda — 24 horas por dia, 7 dias por semana.',
    ctas: [
      { label: 'Ativar meu Agente IA', href: whatsappHref('cta-final-activate') },
      { label: 'Falar com a equipe', href: whatsappHref('cta-final-team') },
    ],
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
