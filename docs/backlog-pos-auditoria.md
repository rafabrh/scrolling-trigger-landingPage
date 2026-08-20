# Backlog pós-auditoria

Fonte: quatro auditorias (`/hm-engineer` em três frentes, `/hm-qa`) mais a
verificação em navegador. Estado da `main` em `79f012e`: 163 testes passando,
typecheck e build limpos.

Só o que está **aberto** entra aqui. O que já foi aplicado está no corpo do
PR 3.

---

## P0 — Bloqueia o deploy

### 1. Os frames não existem em produção
`build` é `next build`. As sequências estão no `.gitignore` e nada as gera no
deploy. O site sobe com poster e cidade final, e o scrub não tem o que desenhar.

Medido: o pipeline precisa de 616 MB de disco temporário (240 PNGs sem perda a
2,6 MB) mais 360 encodes do sharp. Os assets finais somam 23 MB.

Decisão recomendada: versionar `public/cinematic/` e manter `pnpm frames` como
ferramenta de regeneração. Alternativa futura: bucket mais CDN, apontando
`frameSets.dir`.

Arquivos: `.gitignore`, `package.json`.

---

## P1 — Corrige comportamento errado

### 2. NaN ainda atravessa quatro funções
`clampFrame` e `buildLoadPriority` foram protegidos. Seguem sem guarda:
`getSceneProgress`, `getOverlayOpacity`, `fileIndexForFrame`,
`drawCoverDimensions`. Toda comparação ordenada contra NaN é falsa, então o
valor passa e o efeito é silencioso: `drawImage` com argumento não finito é
no-op por spec.

Arquivos: `src/lib/cinematic/frame-math.ts`, `draw-cover.ts`.

### 3. `firstFrameDelivered` dispara para qualquer arquivo
Roda no primeiro decode bem-sucedido de qualquer frame. Como a fila inclui o
frame final, quem ganhar a corrida desmonta o poster e força um desenho de
`getNearest(0)`, que pode ser o frame 239. Resultado: pulo do poster para uma
cena distante no carregamento.

Fix: só entregar quando o arquivo do playhead estiver pronto.
Arquivo: `src/lib/cinematic/frame-cache.ts`.

### 4. Poster do mobile tem o recorte errado
O `final-city-mobile.webp` existe justamente porque o mobile desenha 4:5 e um
fundo 16:9 mostraria a costura. O mesmo argumento vale para o poster, e não foi
aplicado: existe um poster só, 1600x900. No celular o primeiro paint é 16:9 e é
substituído por um canvas 4:5.

Arquivos: `scripts/build-frames.mjs`, `cinematic.config.ts`,
`CinematicExperience.tsx`.

### 5. Reduced-motion descarta o sinal de economia de dados
`resolveCinematicMode` devolve `reduced` antes de ler `saveData`. Quem está em
conexão medida **e** pediu menos movimento baixa a sequência inteira para exibir
algo que, por definição, não vai fazer scrub. Os dois sinais são ortogonais e
não cabem num enum só.

Fix: separar em dois eixos, `frames: 'sequence' | 'stillOnly'` e `scrub: boolean`.
Arquivo: `src/lib/env/device.ts`.

---

## P2 — Custo e manutenção

### 6. Sem CI
163 testes que só rodam quando alguém lembra. Uma regressão na matemática de
frame chega em produção sem nada falhar.

Fix: workflow rodando `pnpm typecheck && pnpm test && pnpm build` no push.

### 7. O deck de copy inteiro vai no bundle do cliente
`CinematicExperience` importa `SITE_CONTENT` para duas chaves e arrasta o objeto
todo para o grafo do cliente. Toda string do site é baixada duas vezes, numa
página cujo ponto é que o conteúdo institucional não depende do bundle.

Fix: separar as chaves do cinematic num módulo próprio.

### 8. O script de build espelha o config e ninguém compara os dois
`EXPECTED`, `SETS` e `FINAL_FRAME` restatam valores do `cinematic.config.ts`.
O `probe()` valida contra o vídeo, nunca contra o config. O caso mais claro é
`quality`: o script pode baixar para 50 e o config segue dizendo 74.

Fix: `quality` sai do `FrameSet` (é parâmetro de encoder, sem sentido em
runtime) e os números compartilhados vão para um JSON lido pelos dois lados.

### 9. `new Date().getFullYear()` no escopo do módulo
A página é pré-renderizada, então o ano do build fica gravado no HTML. Em 1º de
janeiro o site mostra o ano anterior até alguém redeployar.

### 10. Duas convenções de fronteira de cena convivem
`intro` termina em 42 e `sharknews` começa em 43 (meio-aberto), mas `sharknews`
termina em 110 e `aiAgent` começa em 110 (compartilhado). O
`buildSceneSegments` ignora `endFrame` e usa o `startFrame` seguinte, então
`endFrame` só alcança `getSceneProgress`. Nada valida que os dois concordam.

Fix: uma convenção só, mais asserção em desenvolvimento.

### 11. A redução de qualidade re-encoda os 240 do zero
Até sete passadas completas, 1680 encodes, mudando só o parâmetro de qualidade.
Não disparou ainda porque ficamos em 16,4 MB sob o teto de 18.

Fix: estimar por amostragem antes de commitar a passada inteira.

---

## P3 — Higiene

12. `finalFrame` e `frameSets.*.frameCount` são cópias deriváveis de `frameCount`.
13. `device.ts` reexporta `MOBILE_BREAKPOINT_PX` do config, invertendo a direção das camadas.
14. `fileIndexForFrame` monta nome de arquivo sem validar domínio.
15. Exports mortos: `brand.logoAlt`, `SceneRailProps.className`, `GrainOverlay.opacity`.
16. Nada distingue cinematic completo de caminho degradado em produção. Sem log, sem `data-*`, sem evento.
17. `pump` reconstrói a fila de 240 a cada quadro de scroll, mesmo com tudo residente.
18. `dispose()` não aborta os fetches em voo.

---

## Verificação ainda sem prova

Tudo abaixo exige navegador em primeiro plano. Aba em segundo plano congela o
`requestAnimationFrame` e invalida a medição.

19. O handoff é imperceptível? É a promessa central do projeto.
20. Resize redesenha sem deformar.
21. `prefers-reduced-motion` entrega o conteúdo.
22. Enquadramento 4:5 em aparelho real, e o caminho de degradação.
23. O heap volta ao normal depois do handoff.
24. Canvas nunca vazio sob rede lenta.

---

## Não auditado

25. A auditoria de design (`/hm-design`) morreu no limite de sessão antes de
    reportar. Estados de hover, foco, vazio e erro, sistema tipográfico e de
    espaçamento, e diferenciação seguem sem análise.
26. O canvas de design em `design-canvas/` está defasado: acento e scrim
    anteriores à calibragem feita no navegador.
