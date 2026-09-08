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
- Stats bar vive no `site-content.ts`

### 1. Products Section (expandir)
- Manter os 6 servicos atuais (SharkNews, AI Agent, Trafego, Sites, Integracoes, Identidade)
- Expandir cada item com descricao curta do site ao vivo
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

### 3. About Section (expandir)
- Texto principal: copiar descricao completa do "Quem Somos" do site ao vivo
- Manter founders (Rafael Alvarenga, Victor Alves)
- Substituir `notes` atuais pelos 3 pilares: Implantacao agil, Confianca operacional, Ecossistema integrado
- Adicionar metricas de resultados (projetos atendidos, clientes ativos, uptime, tempo de resposta, ativacao)

### 4. Cases Section (manter placeholder)
- Atualizar copy do placeholder para alinhar com tom do site ao vivo
- Manter estrutura de "caso em construcao"

### 5. Plans Section (ativar + enriquecer)
- **Adicionar `PlansSection` na `page.tsx`** (atualmente importada mas nao renderizada)
- Enriquecer cards com features detalhadas do site ao vivo:
  - Start: 12 features completas + "Ativacao em 48h, cancela quando quiser"
  - Pro: tudo do Start + 8 extras + bonus script de abordagem
  - Obsidian: tudo do Pro sem teto + 10 extras + 4 bonus exclusivos + selo OBSIDIAN MEMBER
- Nota de rodape: "Valores base; midia, hospedagem, licencas e terceiros a parte"

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

## Ordem das Secoes na page.tsx

```
CinematicExperience (hero + stats bar)
InstitutionalIntro
ProductsSection
TechnologySection
BenefitsSection        (nova)
AboutSection
ProcessSection         (nova)
IntegrationSection     (nova)
PlansSection           (ativada)
CasesSection
FAQSection             (nova)
SharkNewsSection       (nova)
CTAFinalSection        (nova)
ContactSection
```

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
- CSP existente (`next.config.ts`) nao permite `unsafe-eval` — fetch direto, sem libs externas
- Endpoints de newsletter via env vars com fallback hardcoded
- Estilo segue paleta teal cyberpunk (Chakra Petch headlines, Rajdhani body, accent #00d4aa)
- Componentes seguem padrao `SectionScreen` fullscreen

## Fora de escopo

- Deploy/infra (Easypanel)
- Popup de oferta especial (modal de saida)
- Cookie banner
- Facebook Pixel / GTM
- Video de demonstracao do agente
- Chat mockup animado do hero
