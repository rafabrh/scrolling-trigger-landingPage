# Content Population Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the new cyberpunk site with all content from the live shkgroup.com.br, add 6 new sections, activate Plans, wire newsletter + CAPI integrations, and switch from scroll hijacking to natural scroll with GSAP ScrollTrigger.

**Architecture:** All copy lives in `src/lib/content/site-content.ts` (single source). New section components in `src/components/sections/`. Newsletter form is an isolated client component with `fetch()` to external endpoints. Scroll hijacking replaced by natural scroll + GSAP ScrollTrigger reveal animations.

**Tech Stack:** Next.js 16 (App Router), React 19, GSAP (ScrollTrigger), Tailwind v4, vitest

**Spec:** `docs/superpowers/specs/2026-09-08-content-population-design.md`

**Notes for implementing agents:**
- All Portuguese copy MUST use proper accents (e.g., "Noticias" -> "Noticias" is wrong, use "Notícias"). The code blocks in this plan omit accents for encoding safety — always add them when writing actual code.
- Reuse existing UI components (`CtaLink`, `Eyebrow`, `SectionShell`) whenever applicable.
- `PlansSection` is NOT currently imported in `page.tsx` — it only gets wired in Task 12.

---

### Task 1: CSP — add connect-src for external endpoints

**Files:**
- Modify: `next.config.ts:8-29`

- [ ] **Step 1: Add connect-src directive**

In `next.config.ts`, add the `connect-src` line to the `CONTENT_SECURITY_POLICY` array, after the `font-src` line:

```ts
"connect-src 'self' https://sharknews-sub.com.br https://n8n.shkgroups.com",
```

- [ ] **Step 2: Verify dev server starts without errors**

Run: `pnpm dev` — confirm no startup errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add connect-src to CSP for newsletter and CAPI endpoints"
```

---

### Task 2: Content data — populate site-content.ts with all live site copy

**Files:**
- Modify: `src/lib/content/site-content.ts`
- Modify: `src/lib/content/plans-content.ts`

- [ ] **Step 1: Add heroStats to SITE_CONTENT**

After the `cta` property:

```ts
heroStats: [
  { value: '24/7', label: 'Operacao continua' },
  { value: '~10s', label: 'Tempo de resposta' },
  { value: '100%', label: 'Leads capturados' },
],
```

- [ ] **Step 2: Update nav array**

Replace current nav with:

```ts
nav: [
  { label: 'Produtos', href: '#products' },
  { label: 'Tecnologia', href: '#technology' },
  { label: 'Sobre', href: '#about' },
  { label: 'Planos', href: '#plans' },
  { label: 'FAQ', href: '#faq' },
  { label: 'SharkNews', href: '#sharknews' },
  { label: 'Contato', href: '#contact' },
],
```

- [ ] **Step 3: Expand products.items with descriptions**

Add a `description` field to each item:

```ts
products: {
  eyebrow: 'Produtos',
  headline: 'Dois produtos. Uma operacao.',
  support: 'Um mantem voce a frente do que esta acontecendo. O outro mantem cada canal respondendo a qualquer hora.',
  items: [
    { id: 'sharknews', name: 'SharkNews', tagline: 'Noticias filtradas por IA para o seu nicho.', description: 'Tech news globais curadas diariamente as 07h07. Cinco minutos, gratis, um clique pra sair.', href: '#sharknews' },
    { id: 'ai-agent', name: 'AI Agent', tagline: 'Atendimento humanizado que fecha vendas.', description: 'Automacao de atendimento e vendas 24/7 no WhatsApp e Instagram.' },
    { id: 'trafego', name: 'Trafego', tagline: 'Campanhas otimizadas com dados reais.', description: 'Campanhas de trafego pago otimizadas com dados reais de conversao.' },
    { id: 'sites', name: 'Sites', tagline: 'Presenca digital que converte.', description: 'Sites e landing pages construidos para converter visitante em cliente.' },
    { id: 'integracoes', name: 'Integracoes', tagline: 'Seus sistemas conversando entre si.', description: 'Conectamos CRM, ERP, planilhas e APIs para sua operacao funcionar sozinha.' },
    { id: 'identidade', name: 'Identidade', tagline: 'Marca que comunica sem precisar explicar.', description: 'Branding e identidade visual que posiciona sua marca no mercado.' },
  ],
},
```

- [ ] **Step 4: Replace technology.capabilities with "Na Pratica" items**

```ts
technology: {
  eyebrow: 'Tecnologia',
  headline: 'O que o agente faz, de verdade.',
  support: 'Capacidades disponiveis no WhatsApp Business e Instagram, configuradas por operacao.',
  capabilities: [
    { label: 'Responde com texto e imagens', detail: 'Envia respostas completas com textos formatados e imagens de produtos ou catalogos.' },
    { label: 'Entende audios', detail: 'Transcreve e interpreta mensagens de voz, respondendo com precisao ao conteudo.' },
    { label: 'Comentarios para Direct', detail: 'No Instagram, interage com comentarios e direciona o interessado para conversa privada.' },
    { label: 'Link de pagamento', detail: 'Gera e envia links de pagamento diretamente na conversa, eliminando etapas manuais.' },
    { label: 'QR Code Pix', detail: 'Disponibiliza QR Code para facilitar a conversao imediata dentro da conversa.' },
    { label: 'Agendamentos', detail: 'Agenda consultas, reunioes ou visitas automaticamente com base na disponibilidade.' },
    { label: 'Salva contatos', detail: 'Registra cada novo lead com nome, numero e informacoes relevantes da conversa.' },
    { label: 'Organiza em CRM', detail: 'Exporta dados de cada lead para planilha Google ou CRM integrado automaticamente.' },
    { label: 'Presenca humana', detail: 'Exibe "digitando" e "visualizado" para criar experiencia natural e humana.' },
    { label: 'Memoria de contexto', detail: 'Lembra de informacoes anteriores para respostas mais inteligentes e personalizadas.' },
  ],
},
```

- [ ] **Step 5: Expand about section — absorb InstitutionalIntro content**

```ts
about: {
  eyebrow: 'Quem somos',
  headline: 'Tecnologia que transforma operacoes comerciais.',
  body: 'A SHK GROUP.IA e uma empresa de solucoes digitais que une inteligencia artificial, marketing estrategico e desenvolvimento de software para empresas que precisam vender mais, atender melhor e operar com mais eficiencia. Atuamos como parceiros de crescimento — da automacao do atendimento a construcao de sistemas completos — sempre com foco em resultado mensuravel, velocidade de implantacao e escalabilidade.',
  pillars: [
    { index: '01', label: 'Implantacao agil', detail: 'Resultados em dias, nao meses.' },
    { index: '02', label: 'Confianca operacional', detail: 'Estruturas robustas e seguras.' },
    { index: '03', label: 'Ecossistema integrado', detail: 'IA, marketing e software conectados.' },
  ],
  metrics: [
    { value: '0+', label: 'Projetos atendidos' },
    { value: '0+', label: 'Clientes ativos' },
    { value: '0%', label: 'Uptime de operacao' },
    { value: '0s', label: 'Tempo medio de resposta' },
    { value: '0h', label: 'Ativacao completa' },
  ],
  founders: [
    { name: 'Rafael Alvarenga', role: 'Founder & CTO' },
    { name: 'Victor Alves', role: 'CEO, Campeao Best Seller Mercado Livre 2026' },
  ],
},
```

- [ ] **Step 6: Add benefits data**

```ts
benefits: {
  eyebrow: 'Por que ativar',
  headline: 'Beneficios que impactam diretamente seu faturamento.',
  items: [
    { title: 'Velocidade no atendimento', body: 'Respostas em ate 10 segundos. Nenhum cliente fica sem atencao, independentemente do volume de mensagens.' },
    { title: 'Mais conversao', body: 'Leads atendidos com rapidez e estrategia convertem mais. O Agente IA conduz cada conversa com foco em resultado.' },
    { title: 'Menos esforco manual', body: 'Sua equipe deixa de responder perguntas repetitivas e passa a focar em tarefas estrategicas e de alto valor.' },
    { title: 'Atendimento consistente', body: 'O mesmo padrao de qualidade em cada conversa. Sem variacoes de humor, sem esquecimentos, sem falhas.' },
    { title: 'Captacao e organizacao de leads', body: 'Cada contato e registrado, classificado e salvo automaticamente em planilha ou CRM, pronto para acompanhamento.' },
    { title: 'Escalabilidade operacional', body: 'Atenda 10 ou 10.000 conversas simultaneas sem contratar mais pessoas. O Agente IA escala junto com seu negocio.' },
  ],
},
```

- [ ] **Step 7: Add process data**

```ts
process: {
  eyebrow: 'Processo',
  headline: 'Da contratacao a operacao em quatro passos.',
  steps: [
    { number: '01', title: 'Escolha do canal', body: 'Defina onde o Agente IA vai operar: WhatsApp Business ou Instagram comercial.' },
    { number: '02', title: 'Estruturacao do funil', body: 'Montamos o fluxo de conversa, os gatilhos de qualificacao e o caminho ate o fechamento.' },
    { number: '03', title: 'Integracao', body: 'Conectamos o Agente via QR Code (WhatsApp) ou Meta Developers (Instagram).' },
    { number: '04', title: 'Ativacao em ate 48h', body: 'Seu Agente IA entra em operacao, pronto para atender, qualificar e vender no automatico.' },
  ],
},
```

- [ ] **Step 8: Add integration data**

```ts
integration: {
  eyebrow: 'Integracao',
  headline: 'Conexao simples, ativacao sem burocracia.',
  channels: [
    { name: 'WhatsApp Business', method: 'QR Code', detail: 'Ativacao rapida por QR Code. Basta escanear com seu WhatsApp Business e o Agente entra em operacao imediatamente.', meta: 'QR Code - Ativacao instantanea' },
    { name: 'Instagram Comercial', method: 'Meta API', detail: 'Integracao via Meta Developers com orientacao completa. Opera no Direct e nos comentarios do seu perfil comercial.', meta: 'Meta API - Direct + Comentarios' },
  ],
},
```

- [ ] **Step 9: Add FAQ data**

```ts
faq: {
  eyebrow: 'Perguntas Frequentes',
  headline: 'Tudo o que voce precisa saber antes de ativar.',
  items: [
    { question: 'Em quais canais o Agente IA funciona?', answer: 'Atualmente, o Agente IA opera no WhatsApp Business e no Instagram comercial. A escolha do canal e definida na contratacao do plano, e cada agente e configurado para um canal especifico.' },
    { question: 'Qual e o prazo de ativacao?', answer: 'O Agente IA e ativado em ate 48 horas apos a contratacao. Esse prazo inclui a configuracao do funil, a integracao com o canal escolhido e os testes de operacao.' },
    { question: 'O Agente IA responde sozinho, sem intervencao humana?', answer: 'Sim. O Agente IA opera de forma totalmente autonoma, seguindo o funil de vendas configurado. Ele responde, qualifica, contorna objecoes e conduz ate o fechamento. Quando necessario, pode direcionar o lead para atendimento humano.' },
    { question: 'O Agente IA pode enviar links de pagamento?', answer: 'Sim. O Agente pode enviar links de pagamento e QR Codes diretamente na conversa, permitindo que o cliente finalize a compra sem sair do chat.' },
    { question: 'Preciso de alguma estrutura tecnica para usar?', answer: 'Nao. Voce so precisa de um WhatsApp Business ativo ou um perfil comercial no Instagram. Toda a configuracao tecnica e feita pela equipe da SHK GROUP.IA.' },
    { question: 'Posso contratar outros servicos alem do Agente IA?', answer: 'Sim. A SHK GROUP.IA oferece um ecossistema completo: trafego pago, criacao de sites, desenvolvimento de software, social media e branding. Todos podem ser contratados separadamente ou combinados.' },
  ],
},
```

- [ ] **Step 10: Add sharknewsSection data**

```ts
sharknewsSection: {
  eyebrow: 'SharkNews',
  headline: 'Tech news globais, direto no seu e-mail.',
  support: 'Todo dia as 7:07 da manha, as noticias mais relevantes de tecnologia, IA e inovacao direto na sua caixa de entrada. Comece o dia informado.',
  features: [
    'As noticias de tech que realmente importam',
    'Analises rapidas sobre IA, startups e tendencias',
    'Ferramentas e recursos que ninguem esta falando',
  ],
  meta: [
    { label: 'Curadoria diaria', detail: 'So o que importa, todo dia as 7:07' },
    { label: 'Leitura rapida', detail: '5 minutos antes do cafe' },
    { label: 'Zero spam', detail: 'Cancele com um clique, sem complicacao' },
  ],
  form: {
    namePlaceholder: 'Como posso te chamar?',
    emailPlaceholder: 'seuemail@exemplo.com',
    consentText: 'Aceito receber e-mails da SharkNews e concordo com a',
    consentLink: { label: 'Politica de Privacidade', href: '/privacy' },
    submitLabel: 'Quero receber gratis',
    loadingLabel: 'Inscrevendo...',
    successTitle: 'Inscricao confirmada!',
    successBody: 'Voce vai receber a proxima edicao as 7:07.',
    errorBody: 'Algo deu errado. Tente novamente.',
    privacy: 'Seus dados estao protegidos. Sem spam, nunca.',
  },
},
```

- [ ] **Step 11: Add ctaFinal data**

```ts
ctaFinal: {
  headline: 'Sua empresa pode continuar perdendo vendas por atendimento lento. Ou pode evoluir agora.',
  body: 'Enquanto voce responde manualmente, seus concorrentes estao automatizando. O Agente IA da SHK GROUP.IA transforma cada mensagem em uma oportunidade real de venda — 24 horas por dia, 7 dias por semana.',
  ctas: [
    { label: 'Ativar meu Agente IA', href: whatsappHref('cta-final-activate') },
    { label: 'Falar com a equipe', href: whatsappHref('cta-final-team') },
  ],
},
```

- [ ] **Step 12: Update plans-content.ts with full features**

Replace `PLANS` array in `src/lib/content/plans-content.ts` with expanded features per spec (Start: 12 features, Pro: 8 extras + bonus, Obsidian: 10 extras + 4 bonuses). Keep existing price/accent/cta structure, add `subtag`, `bonuses`, and `vagas` fields.

- [ ] **Step 13: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: type errors in section components that still reference old shapes — that's OK, fixed in subsequent tasks.

- [ ] **Step 14: Commit**

```bash
git add src/lib/content/site-content.ts src/lib/content/plans-content.ts
git commit -m "feat: populate all content data from live site"
```

---

### Task 3: Remove scroll hijacking — switch to natural scroll

**Files:**
- Delete: `src/hooks/use-fullscreen-nav.ts`
- Delete: `src/components/sections/SectionScreen.tsx`
- Delete: `src/components/ui/SectionDots.tsx`
- Modify: `src/app/globals.css` (update section-enter to use ScrollTrigger-compatible classes)
- Modify: `tests/fullscreen-nav.test.ts` (remove or archive)

- [ ] **Step 1: Delete scroll hijacking files**

Delete `src/hooks/use-fullscreen-nav.ts`, `src/components/sections/SectionScreen.tsx`, `src/components/ui/SectionDots.tsx`.

- [ ] **Step 2: Update globals.css — replace section-enter with scroll-reveal**

Replace the `.section-enter` block (lines 96-120) with:

```css
/* Scroll reveal — toggled by GSAP ScrollTrigger adding .revealed */
.scroll-section > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.scroll-section.revealed > * {
  opacity: 1;
  transform: translateY(0);
}
.scroll-section.revealed > *:nth-child(1) { transition-delay: 0s; }
.scroll-section.revealed > *:nth-child(2) { transition-delay: 0.08s; }
.scroll-section.revealed > *:nth-child(3) { transition-delay: 0.16s; }
.scroll-section.revealed > *:nth-child(4) { transition-delay: 0.24s; }
.scroll-section.revealed > *:nth-child(5) { transition-delay: 0.32s; }
.scroll-section.revealed > *:nth-child(6) { transition-delay: 0.40s; }
.scroll-section.revealed > *:nth-child(n+7) { transition-delay: 0.48s; }

.headline-drift {
  transform: translateX(-8px);
  transition: transform 0.5s ease;
}
.scroll-section.revealed .headline-drift {
  transform: translateX(0);
}
```

- [ ] **Step 3: Create ScrollReveal client component**

Create `src/components/effects/ScrollReveal.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('revealed'),
      once: true,
    });

    return () => trigger.kill();
  }, []);

  return (
    <div ref={ref} className="scroll-section">
      {children}
    </div>
  );
}
```

**Important:** `ScrollReveal` does NOT take an `id` prop. Each section component owns its own `id` via `SectionShell` or a direct `<section id="...">`. This avoids duplicate IDs in the DOM.
```

- [ ] **Step 4: Delete fullscreen-nav test**

Remove `tests/fullscreen-nav.test.ts` (tests code that no longer exists).

- [ ] **Step 5: Enable smooth scroll for nav links**

In `src/app/globals.css`, change `scroll-behavior: auto` to `scroll-behavior: smooth`. The original comment said it conflicts with GSAP ScrollTrigger scrub, but we no longer use scrub (only `once: true` triggers), so smooth is safe.

```css
html {
  scroll-behavior: smooth;
}
```

- [ ] **Step 6: Run tests**

Run: `pnpm vitest run`
Expected: all remaining tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-fullscreen-nav.ts src/components/sections/SectionScreen.tsx src/components/ui/SectionDots.tsx tests/fullscreen-nav.test.ts src/components/effects/ScrollReveal.tsx src/app/globals.css
git commit -m "feat: replace scroll hijacking with natural scroll + GSAP ScrollTrigger"
```

Note: `git add` on deleted files stages the deletion.

---

### Task 4: Update existing section components

**Files:**
- Modify: `src/components/sections/ProductsSection.tsx`
- Modify: `src/components/sections/TechnologySection.tsx`
- Modify: `src/components/sections/AboutSection.tsx`
- Modify: `src/components/sections/CasesSection.tsx`
- Modify: `src/components/sections/PlansSection.tsx`
- Modify: `src/components/sections/ContactSection.tsx`

- [ ] **Step 1: Update ProductsSection — add descriptions + SharkNews link**

Update the component to render `item.description` below tagline. For SharkNews item, wrap name in an anchor to `#sharknews`. Use `SectionShell` wrapper for consistency.

- [ ] **Step 2: Update TechnologySection — render new capability objects**

Change from rendering string array to `{ label, detail }` objects. Show label bold, detail below.

- [ ] **Step 3: Update AboutSection — new content structure**

Remove `notes` rendering. Add:
- Expanded body text from live site
- Pillars grid with `index`, `label`, `detail`
- Metrics row (5 stats)
- Founders cards (keep existing)

Absorb InstitutionalIntro's layout pattern (eyebrow + headline + body + pillars).

- [ ] **Step 4: Update CasesSection — refresh placeholder copy**

Keep placeholder structure, update text to match live site tone.

- [ ] **Step 5: Update PlansSection — render expanded features**

Update to render full feature lists from the updated `PLANS` data. Add subtag, bonuses, footer note.

- [ ] **Step 6: Update ContactSection — add urgency copy**

Add urgency headline from `SITE_CONTENT.ctaFinal` above the existing contact content, or directly embed the urgency text.

- [ ] **Step 7: Run typecheck + dev server**

Run: `pnpm tsc --noEmit && pnpm dev`
Expected: zero type errors, page renders.

- [ ] **Step 8: Commit**

```bash
git add src/components/sections/
git commit -m "feat: update existing sections with live site content"
```

---

### Task 5: Create HeroStats component

**Files:**
- Create: `src/components/sections/HeroStats.tsx`

- [ ] **Step 1: Create HeroStats server component**

```tsx
import { SITE_CONTENT } from '@/lib/content/site-content';

export function HeroStats() {
  const stats = SITE_CONTENT.heroStats;
  return (
    <div className="relative z-10 border-y border-[var(--surface-border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-[1248px] items-center justify-center gap-12 px-6 py-6 max-md:flex-col max-md:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-[var(--accent)]">{stat.value}</span>
            <span className="font-mono text-[11px] uppercase tracking-[var(--tracking-wide)] text-[var(--paper-dim)]">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/HeroStats.tsx
git commit -m "feat: add HeroStats component"
```

---

### Task 6: Create BenefitsSection component

**Files:**
- Create: `src/components/sections/BenefitsSection.tsx`

- [ ] **Step 1: Create BenefitsSection**

Server component. Uses `SectionShell` with `id="benefits"`. Renders 6 cards in a 2x3 grid (lg) or stacked (mobile). Each card: title in `font-display-upper`, body in `paper-dim`.

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/BenefitsSection.tsx
git commit -m "feat: add BenefitsSection component"
```

---

### Task 7: Create ProcessSection component

**Files:**
- Create: `src/components/sections/ProcessSection.tsx`

- [ ] **Step 1: Create ProcessSection**

Server component. 4 numbered steps in a vertical list with left-aligned step numbers in accent color, title + body on the right. Uses `SectionShell` with `id="process"`.

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ProcessSection.tsx
git commit -m "feat: add ProcessSection component"
```

---

### Task 8: Create IntegrationSection component

**Files:**
- Create: `src/components/sections/IntegrationSection.tsx`

- [ ] **Step 1: Create IntegrationSection**

Server component. 2 cards side by side (lg:grid-cols-2). Each card: channel name, method badge, detail text, meta line. Uses `SectionShell` with `id="integration"`.

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/IntegrationSection.tsx
git commit -m "feat: add IntegrationSection component"
```

---

### Task 9: Create FAQSection component

**Files:**
- Create: `src/components/sections/FAQSection.tsx`

- [ ] **Step 1: Create FAQSection**

Server component using native `<details>/<summary>` for accordion (no JS needed, accessible by default). Each FAQ item: summary = question, details content = answer. Uses `SectionShell` with `id="faq"`.

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/FAQSection.tsx
git commit -m "feat: add FAQSection with accordion"
```

---

### Task 10: Create SharkNewsSection with newsletter form

**Files:**
- Create: `src/components/sections/SharkNewsSection.tsx` (client component)
- Create: `src/lib/newsletter/subscribe.ts` (fetch logic)

- [ ] **Step 1: Create subscribe helper**

`src/lib/newsletter/subscribe.ts`:

```ts
const SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_SHARKNEWS_SUBSCRIBE_URL ||
  'https://sharknews-sub.com.br/api/subscribe';

const CAPI_URL =
  process.env.NEXT_PUBLIC_CAPI_WEBHOOK_URL ||
  'https://n8n.shkgroups.com/webhook/capi-lead';

export interface SubscribePayload {
  name: string;
  email: string;
}

export async function subscribeNewsletter({ name, email }: SubscribePayload): Promise<void> {
  const body = {
    name,
    first_name: name,
    email,
    consentAccepted: true,
    source: 'site_shkgroup',
    page_url: typeof window !== 'undefined' ? window.location.href : '',
    page_title: typeof document !== 'undefined' ? document.title : '',
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = process.env.NEXT_PUBLIC_SHARKNEWS_API_KEY;
  if (apiKey) headers['X-Admin-Token'] = apiKey;

  const res = await fetch(SUBSCRIBE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Subscribe failed: ${res.status}`);
  }

  // CAPI fire-and-forget
  fetch(CAPI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((err) => console.warn('[CAPI]', err));
}
```

- [ ] **Step 2: Create SharkNewsSection client component**

`src/components/sections/SharkNewsSection.tsx`:

Client component with `'use client'`. Form with:
- Name input (optional)
- Email input (required, client-side validation)
- Consent checkbox with link to `/privacy`
- Submit button with loading/success/error states
- Calls `subscribeNewsletter()` on submit
- Copy from `SITE_CONTENT.sharknewsSection`

Wrap section in `id="sharknews"` and use the cyberpunk styling (accent borders, font-display-upper headline, paper-dim body).

- [ ] **Step 3: Write test for subscribe helper**

Create `tests/newsletter-subscribe.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test that subscribeNewsletter calls the correct endpoints with correct payload.
// Mock global fetch.
```

- [ ] **Step 4: Run test**

Run: `pnpm vitest run tests/newsletter-subscribe.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/newsletter/ src/components/sections/SharkNewsSection.tsx tests/newsletter-subscribe.test.ts
git commit -m "feat: add SharkNewsSection with newsletter subscription + CAPI"
```

---

### Task 11: Create CTAFinalSection component

**Files:**
- Create: `src/components/sections/CTAFinalSection.tsx`

- [ ] **Step 1: Create CTAFinalSection**

Server component. Big urgency headline, body text, 2 CTA buttons (primary accent + secondary outline). Uses `id="cta-final"` and full-width dark background for visual break.

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/CTAFinalSection.tsx
git commit -m "feat: add CTAFinalSection with urgency copy"
```

---

### Task 12: Wire page.tsx — assemble all sections in order

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Remove InstitutionalIntro completely**

- Delete the import and `<InstitutionalIntro />` from `page.tsx`
- Delete the file `src/components/sections/InstitutionalIntro.tsx`
- Remove the `intro` key from `SITE_CONTENT` in `src/lib/content/site-content.ts` (its content has been absorbed into the `about` key in Task 2)

- [ ] **Step 2: Add imports for all new components**

```tsx
import { HeroStats } from '@/components/sections/HeroStats';
import { BenefitsSection } from '@/components/sections/BenefitsSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { IntegrationSection } from '@/components/sections/IntegrationSection';
import { PlansSection } from '@/components/sections/PlansSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { SharkNewsSection } from '@/components/sections/SharkNewsSection';
import { CTAFinalSection } from '@/components/sections/CTAFinalSection';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
```

- [ ] **Step 3: Assemble sections in spec order**

Inside `<main id="top">`, wrap each section in `<ScrollReveal>`:

```tsx
<CinematicExperience />
<HeroStats />
<ScrollReveal><ProductsSection /></ScrollReveal>
<ScrollReveal><TechnologySection /></ScrollReveal>
<ScrollReveal><BenefitsSection /></ScrollReveal>
<ScrollReveal><AboutSection /></ScrollReveal>
<ScrollReveal><CasesSection /></ScrollReveal>
<ScrollReveal><ProcessSection /></ScrollReveal>
<ScrollReveal><IntegrationSection /></ScrollReveal>
<ScrollReveal><PlansSection /></ScrollReveal>
<ScrollReveal><FAQSection /></ScrollReveal>
<ScrollReveal><SharkNewsSection /></ScrollReveal>
<ScrollReveal><CTAFinalSection /></ScrollReveal>
<ScrollReveal><ContactSection /></ScrollReveal>
```

Each section component owns its `id` via `SectionShell` or direct `<section id="...">`. `ScrollReveal` is just a reveal animation wrapper.

- [ ] **Step 4: Run typecheck + dev server**

Run: `pnpm tsc --noEmit`
Expected: zero errors.

Run: `pnpm dev` — open localhost:3000, scroll through all sections.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire all sections in page.tsx with ScrollReveal"
```

---

### Task 13: Visual QA + final cleanup

**Files:**
- Possibly modify any section component for spacing/alignment fixes

- [ ] **Step 1: Scroll through entire site in browser**

Open localhost:3000. Check:
- All 13 sections render in correct order
- ScrollReveal animations fire on scroll
- Newsletter form submits successfully (or shows appropriate error)
- WhatsApp CTAs open correct wa.me link
- Nav links scroll to correct sections
- Mobile responsive (resize to 390x844)
- No console errors

- [ ] **Step 2: Fix any visual issues found**

Adjust spacing, typography, or responsive breakpoints as needed.

- [ ] **Step 3: Run full test suite**

Run: `pnpm vitest run`
Expected: all tests pass.

- [ ] **Step 4: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: zero errors.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: visual QA adjustments"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | CSP connect-src | none |
| 2 | Content data population | none |
| 3 | Remove scroll hijacking | none |
| 4 | Update existing sections | 2 |
| 5 | HeroStats component | 2 |
| 6 | BenefitsSection | 2 |
| 7 | ProcessSection | 2 |
| 8 | IntegrationSection | 2 |
| 9 | FAQSection | 2 |
| 10 | SharkNewsSection + newsletter | 1, 2 |
| 11 | CTAFinalSection | 2 |
| 12 | Wire page.tsx | 3, 4, 5, 6, 7, 8, 9, 10, 11 |
| 13 | Visual QA | 12 |

Tasks 1-3 are independent and can run in parallel.
Tasks 4-11 depend on Task 2 (content data) and can run in parallel after it.
Task 12 assembles everything.
Task 13 is final validation.
