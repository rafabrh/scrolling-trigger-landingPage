# Fullscreen Sections — Design Spec

## Resumo

Após o cinematic do tubarão (240 frames scroll-driven), o site transiciona para seções fullscreen estáticas. O scroll não rola a página — ele troca de seção com efeitos de distorção cyberpunk. O último frame do cinematic (frame-0239.webp) permanece como background estático.

## Seções (6 telas)

### S1 — Produtos
- Headline: DOIS PRODUTOS. UMA OPERAÇÃO.
- Layout: editorial left (headline gigante esquerda) + coluna direita com 6 serviços
- Serviços: SharkNews, AI Agent, Tráfego Pago, Criação de Sites, Integrações com APIs Oficiais, Identidade Visual
- CTA: Ativar AI Agent

### S2 — Tecnologia
- Headline: O QUE O AGENTE FAZ, DE VERDADE.
- Layout: headline bottom-left + lista de capacidades estilo terminal à direita
- Foco: diferenciadores técnicos do agente IA

### S3 — Sobre
- Headline: UM PARCEIRO DENTRO DA OPERAÇÃO.
- Layout: headline + pilares à esquerda + fundadores à direita
- Fundadores: Rafael Alvarenga (Founder & CTO) + Victor Alves (CEO, Campeão Best Seller Mercado Livre 2026)

### S4 — Cases
- Headline: RESULTADOS, QUANDO PUDEREM SER MOSTRADOS.
- Estado vazio intencional — placeholders honestos
- Seção reservada para trabalhos com resultados verificáveis

### S5 — Planos
- Layout: 3 tiers editoriais horizontais (nome | features | preço + CTA)
- START: R$99,90/mês — verde (#00d4aa) — 1 canal, 1 funil, 1 integração
- PRO: R$197,90/mês — violeta (#a78bfa) — 2 canais, 2 funis, 3 integrações, badge MAIS ESCOLHIDO
- OBSIDIAN: R$547,90/mês — amber (#f59e0b) — ilimitado, pill MEMBER, VAGAS LIMITADAS

### S6 — Contato
- Headline: COMECE A CONVERSA NO WHATSAPP.
- Full-width minimalista, CTA dominante teal

## Tipografia

- Headlines: Chakra Petch (700, uppercase, letter-spacing: 0.02em) — angular, geométrica, DNA cyberpunk
- Body: Rajdhani (300-600) — tech/industrial, legível
- Source: Google Fonts, zero custo de licença

## Paleta de cores

Derivada diretamente do cinematic (teal/dark):

- Background: #050607
- Accent: #00d4aa
- Text primary: #e0f0ea (branco teal-tinted)
- Text secondary: rgba(224,240,234,.6)
- Borders/dividers: rgba(0,212,170,.12)
- Tab inactive: #1a2a25
- PRO accent: #a78bfa
- OBSIDIAN accent: #f59e0b

## Background

- Imagem: /cinematic/desktop/frame-0239.webp (último frame do cinematic)
- Position: fixed, cover, opacity 0.35
- Overlay: radial-gradient teal sutil no bottom-center + gradient escurecedor para legibilidade
- Transição seamless: o cinematic termina nesse frame, que vira o bg estático

## Efeitos de transição (CSS + GSAP)

Ao trocar de seção via scroll:

1. **Flicker** (0.3s) — opacity pisca 4x rapidamente
2. **Scan sweep** (0.6s) — linha teal brilhante varre de cima pra baixo
3. **Chromatic aberration** (0.4s) — headlines com split vermelho/teal que converge
4. **Scanlines VCR** — overlay permanente sutil (repeating-linear-gradient rolando)
5. **Section enter** — elementos entram com stagger (opacity + translateY, 0.08s por child)
6. **Headline drift** — headlines entram com translateX(-8px) adicional

## Scroll hijacking (GSAP)

- ScrollTrigger pin na viewport inteira
- Cada scroll event avança/retrocede uma seção
- Debounce de ~800ms entre transições
- Navegação por teclado (setas) e dots indicadores
- Mobile: swipe up/down via touch events

## Stack de implementação

- Next.js 16 (App Router) + React 19
- GSAP ScrollTrigger para scroll hijacking
- CSS animations para efeitos de entrada
- GSAP timelines para transições mais complexas (chromatic aberration, flicker)
- Tailwind v4 para utilities
- next/font para Chakra Petch + Rajdhani

## Copys — precisam refinamento

Todas as copys atuais são placeholder. Próximo passo: reescrever com tom direto, sem perfumaria, alinhado ao posicionamento 'parceiro de operação' da SHK.

## Referências

- Paper: 'On AI-Inspired UI-Design' (arXiv:2406.13631) — IA como colaborador, não substituto
- Pond5 digital distortion templates — chromatic aberration, scanlines, flicker
- Alura tipografias — Chakra Petch validada para cyberpunk/tech
- Mockup: .superpowers/brainstorm/2209-1787633619/all-sections.html
