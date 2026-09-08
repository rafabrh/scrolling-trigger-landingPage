# Spec: Populacao de Conteudo do Site Ao Vivo para o Novo Layout

Data: 2026-09-08
Status: aprovado pelo usuario

## Contexto

O site novo (Next.js 16, App Router, fullscreen cyberpunk) tem estrutura visual pronta mas conteudo incompleto. O site ao vivo (`www.shkgroup.com.br`) tem todo o conteudo de producao. O objetivo e migrar todo o conteudo para o novo site, adaptando textos ao tom cyberpunk e criando secoes que ainda nao existem.

## Integracoes Externas

### Newsletter SharkNews
- **Endpoint:** `POST https://sharknews-sub.com.br/api/subscribe`
- **Payload:**
  ```json
  {
    "name": "string",
    "first_name": "string",
    "email": "string",
    "consentAccepted": true,
    "source": "site_shkgroup",
    "page_url": "string",
    "page_title": "string"
  }
  ```
- **Header opcional:** `X-Admin-Token` (se configurado via env var)

### Facebook CAPI (via n8n)
- **Endpoint:** `POST https://n8n.shkgroups.com/webhook/capi-lead`
- Disparado junto com a inscricao da newsletter

### WhatsApp
- **URL base:** `https://wa.me/5511912839594`
- Ja implementado via `src/lib/content/whatsapp.ts`

## Secoes Existentes — Atualizacao de Conteudo

### 0. Cinematic Hero (manter estrutura, enriquecer)
- Manter animacao cinematica existente
- Adicionar stats bar apos o cinematic: `24/7 Operacao continua`, `~10s Tempo de resposta`, `100% Leads capturados`
- Stats bar e um novo server component `HeroStats.tsx`, renderizado em `page.tsx` logo apos `CinematicExperience` e antes das secoes de conteudo
- Dados vivem em `SITE_CONTENT.heroStats`

### 1. Products Section (expandir)
- Manter os 6 servicos atuais (SharkNews, AI Agent, Trafego, Sites, Integracoes, Identidade)
- Expandir cada item com descricao curta do site ao vivo
- Item SharkNews ganha link ancora `#sharknews` para o usuario navegar ate a secao dedicada
- Adicionar taglines do ecossistema completo

Content de referencia (site ao vivo):
- Agente IA: "Automacao de atendimento e vendas 24/7"
- Trafego Pago: campanhas otimizadas
- Web: presenca digital que converte
- Software: desenvolvimento sob medida
- Social & Branding: marca que comunica

### 2. Technology Section (enriquecer com "Na Pratica")
- Substituir lista atual de 11 capabilities pelas 10 capacidades "Na Pratica" do site ao vivo
- Cada item com icone/label descritivo em vez de emoji
- Conteudo:
  1. Responde com texto e imagens
  2. Entende audios
  3. Comentarios para Direct (Instagram)
  4. Link de pagamento
  5. QR Code Pix
  6. Agendamentos
  7. Salva contatos
  8. Organiza em CRM
  9. Presenca humana (digitando/visualizado)
  10. Memoria de contexto

### 3. About Section (expandir + absorver InstitutionalIntro)
- **Remover `InstitutionalIntro` da page.tsx** — seu conteudo e absorvido pelo About
- O eyebrow "Quem somos", headline e body do InstitutionalIntro migram para o About como abertura
- Texto principal: copiar descricao completa do "Quem Somos" do site ao vivo
- Manter founders (Rafael Alvarenga, Victor Alves)
- Substituir `notes` atuais pelos 3 pilares: Implantacao agil, Confianca operacional, Ecossistema integrado
- Metricas de resultados com valores placeholder "0+" (sem numeros inventados):
  - `0+` Projetos atendidos
  - `0+` Clientes ativos
  - `0%` Uptime de operacao (placeholder, sem metrica real)
  - `0s` Tempo medio de resposta (placeholder)
  - `0h` Ativacao completa (placeholder)

### 4. Cases Section (manter placeholder)
- Atualizar copy do placeholder para alinhar com tom do site ao vivo
- Manter estrutura de "caso em construcao"

### 5. Plans Section (ativar + enriquecer)
- **Adicionar `PlansSection` na `page.tsx`** (atualmente importada mas nao renderizada)
- Nota de rodape: "Valores base; midia, hospedagem, licencas e terceiros a parte"
- Features detalhadas por tier (extraidas do site ao vivo):

**Start (R$99,90/mês):**
1. 1 canal ativo (WhatsApp ou Instagram)
2. 1 funil de atendimento estruturado
3. 1 integracao configurada
4. Le audios e responde com naturalidade
5. Atende com texto, imagem e video
6. Responde comentarios e puxa pro direct
7. Envia link de pagamento no momento certo
8. Agendamentos automaticos
9. Base de clientes sempre crescendo
10. Planilha CRM (origem, status, funil)
11. Comportamento humanizado (digitando/visualizando)
12. Memoria + Anthropic para respostas de alto nivel
- Tagline: "A porta de entrada para a automacao inteligente."
- Subtag: "Ativacao em 48h - cancela quando quiser"

**Pro (R$197,90/mês):**
Tudo do Start +
1. 2 canais simultaneos (WhatsApp + Instagram)
2. 2 funis (vendas e suporte ao mesmo tempo)
3. 3 integracoes (CRM, Google Agenda, planilhas e mais)
4. Fluxo de reativacao automatica de leads frios
5. Relatorio semanal de desempenho no WhatsApp
6. Sequencia de follow-up automatico configurada
7. Suporte prioritario (resposta em ate 4h)
8. 1 otimizacao de fluxo por mes incluida
- Bonus: Script de abordagem ativa personalizado para o nicho
- Badge: "MAIS ESCOLHIDO"
- Subtag: "Ativacao em 48h - cancela quando quiser"

**Obsidian (R$547,90/mês):**
Tudo do Pro, sem teto +
1. Canais ilimitados (WhatsApp, Instagram, Site, E-mail)
2. Funis ilimitados (vendas, suporte, onboarding, cobranca, retencao)
3. Integracoes avancadas (ERP, APIs externas, webhooks, CRM proprio)
4. Base de conhecimento (documentos, tabelas, historico completo)
5. IA treinada com a linguagem e persona da marca
6. Dashboard de metricas em tempo real
7. Campanha de reativacao mensal configurada pela equipe
8. Reuniao mensal de estrategia e otimizacao
9. Suporte VIP dedicado (resposta em ate 1h)
10. 3 otimizacoes de fluxo por mes incluidas
- Bonus exclusivos:
  1. Persona digital da marca criada do zero
  2. Mapeamento completo do funil de vendas no onboarding
  3. Acesso antecipado a novos recursos
  4. Selo OBSIDIAN MEMBER (cliente prioritario)
- Badge: "MEMBER"
- Tag: "EXCLUSIVO - VAGAS LIMITADAS"

### 6. Contact Section (enriquecer com urgencia)
- Adicionar copy de urgencia do site ao vivo: "Sua empresa pode continuar perdendo vendas por atendimento lento. Ou pode evoluir agora."
- Manter CTAs WhatsApp + Instagram

## Secoes Novas a Criar

### 7. Benefits Section (nova)
- Secao "Por que ativar"
- 6 cards:
  1. Velocidade no atendimento — respostas em ate 10s
  2. Mais conversao — leads atendidos com rapidez convertem mais
  3. Menos esforco manual — equipe foca em tarefas estrategicas
  4. Atendimento consistente — mesmo padrao sempre
  5. Captacao e organizacao de leads — CRM automatico
  6. Escalabilidade operacional — 10 ou 10.000 conversas
- Componente: `BenefitsSection.tsx`
- Dados: `SITE_CONTENT.benefits`

### 8. Process Section (nova)
- Secao "Da contratacao a operacao em quatro passos"
- 4 steps numerados:
  1. Escolha do canal (WhatsApp Business ou Instagram)
  2. Estruturacao do funil (fluxo, gatilhos, caminho)
  3. Integracao (QR Code ou Meta Developers)
  4. Ativacao em ate 48h
- Componente: `ProcessSection.tsx`
- Dados: `SITE_CONTENT.process`

### 9. Integration Section (nova)
- Secao "Conexao simples, ativacao sem burocracia"
- 2 blocos:
  - WhatsApp Business: ativacao por QR Code, instantanea
  - Instagram Comercial: Meta API, Direct + Comentarios
- Componente: `IntegrationSection.tsx`
- Dados: `SITE_CONTENT.integration`

### 10. FAQ Section (nova)
- Secao "Perguntas Frequentes"
- 6 perguntas com respostas expandiveis (accordion ou toggle):
  1. Em quais canais o Agente IA funciona?
  2. Qual e o prazo de ativacao?
  3. O Agente IA responde sozinho?
  4. O Agente IA pode enviar links de pagamento?
  5. Preciso de alguma estrutura tecnica?
  6. Posso contratar outros servicos?
- Componente: `FAQSection.tsx`
- Dados: `SITE_CONTENT.faq`

### 11. SharkNews Section (nova — prioridade alta)
- Secao "SharkNews — Tech news direto no seu email"
- Copy do site ao vivo: diario as 7:07, curadoria de tech/IA/inovacao
- Formulario client component com:
  - Campo nome (opcional)
  - Campo email (obrigatorio)
  - Checkbox consent com link para `/privacy`
  - Botao submit com loading state
- Ao submeter:
  1. `POST https://sharknews-sub.com.br/api/subscribe` com payload completo
  2. `POST https://n8n.shkgroups.com/webhook/capi-lead` (CAPI tracking)
- Estados: idle, loading, success, error
- Validacao client-side de email
- Componente: `SharkNewsSection.tsx` (client component)
- Dados estaticos: `SITE_CONTENT.sharknews` (copy)
- Endpoints: env vars `NEXT_PUBLIC_SHARKNEWS_SUBSCRIBE_URL` e `NEXT_PUBLIC_CAPI_WEBHOOK_URL`
  - Fallback hardcoded para os URLs atuais se env vars nao definidas

### 12. CTA Final Section (nova)
- Secao de urgencia antes do footer
- Copy: "Sua empresa pode continuar perdendo vendas... Ou pode evoluir agora."
- 2 CTAs: "Ativar meu Agente IA" (WhatsApp) + "Falar com a equipe" (WhatsApp)
- Componente: `CTAFinalSection.tsx`
- Dados: `SITE_CONTENT.ctaFinal`

## Estrutura de Dados (site-content.ts)

Todas as novas copys seguem o padrao existente: objetos tipados em `site-content.ts`, sem strings hardcodadas em componentes.

Novas chaves no `SITE_CONTENT`:
- `heroStats` — array de { value, label }
- `benefits` — { eyebrow, headline, items[] }
- `process` — { eyebrow, headline, steps[] }
- `integration` — { eyebrow, headline, channels[] }
- `faq` — { eyebrow, headline, items[{ question, answer }] }
- `sharknewsSection` — { eyebrow, headline, support, features[], form labels }
- `ctaFinal` — { headline, body, ctas[] }

Chaves existentes atualizadas:
- `products.items` — descricoes expandidas
- `technology.capabilities` — substituidas pelas 10 "Na Pratica"
- `about` — texto expandido + metricas + pilares atualizados
- `plans` (em `plans-content.ts`) — features detalhadas por tier

## Arquitetura de Scroll

O scroll hijacking fullscreen (`useFullscreenNav` + `SectionScreen`) foi projetado para 6 secoes.
Com 13 secoes (InstitutionalIntro removido), scroll hijacking se torna inviavel:
- 13 dots na lateral e visualmente ruim
- ~10.4s de scrolls consecutivos para chegar ao fim (800ms debounce x 13)

**Decisao: scroll natural com animacoes GSAP ScrollTrigger.**
- Remover `useFullscreenNav` e `SectionScreen` como wrappers obrigatorios
- Cada secao ocupa a altura natural do conteudo (min-height: 100vh para secoes curtas)
- Animacoes de entrada via GSAP ScrollTrigger (fade-in + stagger dos filhos)
- TransitionFX (scanlines, flicker) disparam na entrada de cada secao via ScrollTrigger
- SectionDots removidos (nao fazem sentido com scroll natural)
- Nav links usam scroll suave (`scroll-behavior: smooth` ou GSAP scrollTo)

## Ordem das Secoes na page.tsx

```
CinematicExperience (hero)
HeroStats              (novo, server component)
ProductsSection
TechnologySection
BenefitsSection        (nova)
AboutSection           (absorve InstitutionalIntro)
CasesSection
ProcessSection         (nova)
IntegrationSection     (nova)
PlansSection           (ativada)
FAQSection             (nova)
SharkNewsSection       (nova)
CTAFinalSection        (nova)
ContactSection
```

Notas sobre a ordem:
- CasesSection fica apos About (antes de Process/Plans) para nao quebrar o fluxo entre pricing e FAQ
- InstitutionalIntro removido (conteudo absorvido pelo About)

## Nav atualizada

```ts
nav: [
  { label: 'Produtos', href: '#products' },
  { label: 'Tecnologia', href: '#technology' },
  { label: 'Sobre', href: '#about' },
  { label: 'Planos', href: '#plans' },
  { label: 'FAQ', href: '#faq' },
  { label: 'SharkNews', href: '#sharknews' },
  { label: 'Contato', href: '#contact' },
]
```

Removido "Cases" do nav (placeholder, nao e destino util). Adicionados FAQ e SharkNews.

## Restricoes

- Toda copy em pt-BR
- Nenhuma metrica inventada — manter "0+" como no site ao vivo para numeros nao confirmados
- Formulario de newsletter e client component isolado (nao arrasta bundle pro server)
- **Newsletter usa `fetch()` para submit, NAO native form action** — a CSP tem `form-action 'self'` que bloquearia POST externo via form action
- **CSP precisa de `connect-src`** — a CSP atual tem `default-src 'self'` sem `connect-src` explicito. Fetch para dominios externos sera bloqueado. Adicionar:
  ```
  connect-src 'self' https://sharknews-sub.com.br https://n8n.shkgroups.com
  ```
- CSP nao permite `unsafe-eval` — fetch direto, sem libs externas
- Endpoints de newsletter via env vars com fallback hardcoded
- Estilo segue paleta teal cyberpunk (Chakra Petch headlines, Rajdhani body, accent #00d4aa)
- Secoes usam scroll natural com GSAP ScrollTrigger (nao mais SectionScreen fullscreen)
- **CAPI webhook e fire-and-forget** — se o subscribe da newsletter der sucesso mas o CAPI falhar, o usuario ve sucesso. Erro no CAPI e silencioso (log no console apenas)

## Fora de escopo

- Deploy/infra (Easypanel)
- Popup de oferta especial (modal de saida)
- Cookie banner
- Facebook Pixel / GTM
- Video de demonstracao do agente
- Chat mockup animado do hero
