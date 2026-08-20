# Tasks para nível de mercado

Base: `main` em `79f012e`. 163 testes passando, typecheck e build limpos.

Consolida as auditorias de código e as medições feitas contra o build de
produção (`next start`), não contra o dev server. Cada item tem número medido ou
arquivo apontado. O que já foi corrigido não entra aqui.

---

## Medições de referência

| Métrica | Valor | Como |
| --- | --- | --- |
| Payload do primeiro load | **16,64 MB em 250 requisições** | `performance.getEntriesByType('resource')`, `scrollY` 0 |
| Frames baixados sem rolar | **236 de 240, 16,12 MB** | idem |
| Janela de download dos frames | 1.292 ms a 6.093 ms | idem |
| DOM interativo | 264 ms | Navigation Timing |
| Load completo | 1.089 ms | Navigation Timing |
| Bundle do cliente | 748 KB, maior chunk 223,6 KB | `.next/static/chunks` |
| `public/` | 23 MB | `du -sh` |
| Vulnerabilidades | nenhuma | `pnpm audit` |
| Headers de segurança | nenhum | `curl -I` |

---

## P0 — Impede o site de funcionar ou de ser aceitável

### 1. Os frames não existem em produção
`build` é `next build` e as sequências estão no `.gitignore`. O site sobe sem o
que desenhar.

Números para a decisão: rodar o pipeline no container custa **616 MB de disco
temporário** (240 PNGs sem perda a 2,6 MB) mais 360 encodes do sharp **a cada
deploy**. Versionar custa **23 MB uma vez**.

Fix: tirar `public/cinematic/{desktop,mobile}` do `.gitignore` e commitar.
Manter `pnpm frames` como ferramenta de regeneração.

### 2. A página baixa 16 MB sem o usuário rolar
`buildLoadPriority` devolve a fila inteira de 240 frames e o pump a drena na
velocidade máxima da concorrência. Medido: 236 frames, 16,12 MB, numa janela de
4,8 s, com `scrollY` em 0.

Num 4G de 5 Mbps isso é meio minuto de downlink saturado, cobrado do visitante
que abriu, leu o header e saiu. O spec pedia que o primeiro paint não esperasse
a sequência; ele não espera, mas baixa tudo assim mesmo.

Fix: separar a fila em urgente e cauda. Urgente são as âncoras (frame 0 e
final), a cabeça e a janela ao redor do playhead. A cauda só começa depois de o
usuário ter rolado dentro da seção do cinematic, e com concorrência menor.
Arquivos: `src/lib/cinematic/load-policy.ts`, `frame-cache.ts`.

### 3. O favicon é o padrão do Next.js
`src/app/favicon.ico` nunca foi trocado. O site sobe hoje com o logo do Next na
aba do navegador.

Fix: gerar `src/app/icon.png` e `apple-icon.png` a partir de
`public/brand/logo.png`.

---

## P1 — Comportamento errado ou ausência que custa conversão

### 4. NaN atravessa quatro funções sem guarda
`getSceneProgress`, `getOverlayOpacity`, `fileIndexForFrame` e
`drawCoverDimensions`. Toda comparação ordenada contra NaN é falsa, então o
valor passa. `drawImage` com argumento não finito é no-op por spec: o canvas
para sem erro e sem log. `clampFrame` e `buildLoadPriority` já foram protegidos.

### 5. Sem `opengraph-image`
Os canais declarados do produto são WhatsApp e Instagram. Um link colado no
WhatsApp hoje vira o card mais pobre que a plataforma produz, sem imagem.

Fix: `src/app/opengraph-image.png` em 1200x630, usando o frame 239.

### 6. `robots.txt` e `sitemap.xml` dão 404
Fix: `src/app/robots.ts` e `src/app/sitemap.ts`.

### 7. Sem error boundary e sem página 404 própria
Não existem `error.tsx` nem `not-found.tsx`. Um erro de cliente derruba a página
para a tela padrão do framework.

### 8. `firstFrameDelivered` dispara para qualquer arquivo
Roda no primeiro decode bem-sucedido de qualquer frame. Como a fila inclui o
frame final, quem ganhar a corrida desmonta o poster e força um desenho de
`getNearest(0)`, que pode ser o frame 239.

### 9. Poster do mobile tem o recorte errado
Existe um poster só, 1600x900. No celular o primeiro paint é 16:9 e é
substituído por um canvas 4:5. É o mesmo defeito que o `final-city-mobile.webp`
existe para evitar.

### 10. Reduced-motion descarta o sinal de economia de dados
`resolveCinematicMode` devolve `reduced` antes de ler `saveData`. Quem está em
conexão medida e pediu menos movimento baixa a sequência inteira para exibir
algo que não vai fazer scrub. São dois eixos ortogonais num enum só.

### 11. Sem CI
163 testes que só rodam quando alguém lembra.

Fix: workflow com `pnpm typecheck && pnpm test && pnpm build` no push.

### 12. Sem headers de segurança
Nenhum CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy ou
Permissions-Policy. Sendo estático e sem entrada de usuário, o que isso expõe é
clickjacking e sniffing de MIME, não vazamento de dado. Ainda assim é ausência
que qualquer auditoria de comprador aponta em cinco minutos.

---

## P2 — Custo, manutenção e observabilidade

13. O deck de copy inteiro vai no bundle do cliente. `CinematicExperience` importa `SITE_CONTENT` por duas chaves e arrasta o objeto todo.
14. O script de build espelha o config e ninguém compara os dois. `quality` pode divergir silenciosamente.
15. `new Date().getFullYear()` no escopo do módulo: o ano do build fica gravado no HTML pré-renderizado.
16. Duas convenções de fronteira de cena convivem, e `endFrame` não alcança o mapeamento de scroll.
17. A redução de qualidade re-encoda os 240 do zero, até sete passadas.
18. Nada distingue cinematic completo de caminho degradado em produção. Sem log, sem `data-*`, sem evento.
19. Sem analytics nem rastreio de conversão nos CTAs do WhatsApp. Não há como saber se o cinematic converte.

---

## P3 — Higiene

20. `finalFrame` e `frameSets.*.frameCount` são cópias deriváveis de `frameCount`.
21. `device.ts` reexporta `MOBILE_BREAKPOINT_PX` do config, invertendo a direção das camadas.
22. `fileIndexForFrame` monta nome de arquivo sem validar domínio.
23. Exports mortos: `brand.logoAlt`, `SceneRailProps.className`, `GrainOverlay.opacity`.
24. `pump` reconstrói a fila de 240 a cada quadro de scroll, mesmo com tudo residente.
25. `dispose()` não aborta os fetches em voo.

---

## Verificação ainda sem prova

Exige navegador em primeiro plano: aba em segundo plano congela o
`requestAnimationFrame` e invalida a medição.

26. O handoff é imperceptível. É a promessa central do projeto.
27. Resize redesenha sem deformar.
28. `prefers-reduced-motion` entrega o conteúdo.
29. Enquadramento 4:5 em aparelho real, e o caminho de degradação.
30. O heap volta ao normal depois do handoff.
31. Canvas nunca vazio sob rede lenta.
