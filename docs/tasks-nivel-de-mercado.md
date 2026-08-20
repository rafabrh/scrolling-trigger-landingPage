# Tasks para nível de mercado

Base: `main` em `79f012e`. 163 testes passando, typecheck e build limpos.

Cinco auditorias: três de código (runtime, lógica pura e pipeline, superfície
React), uma de segurança e prontidão de produção, uma de design. Mais as
medições feitas contra o **build de produção** (`next start`), não contra o dev
server.

Cada item tem número medido ou arquivo apontado. O que já foi corrigido não
entra aqui.

---

## Medições de referência

| Métrica | Valor | Método |
| --- | --- | --- |
| Payload do primeiro load | **16,64 MB em 250 requisições** | Resource Timing, `scrollY` 0 |
| Frames baixados sem rolar | **236 de 240, 16,12 MB** | idem |
| Janela de download dos frames | 1.292 ms a 6.093 ms | idem |
| DOM interativo | 264 ms | Navigation Timing |
| Load completo | 1.089 ms | Navigation Timing |
| Bundle do cliente | 748 KB, maior chunk 223,6 KB | `.next/static/chunks` |
| `public/` | 23 MB | `du -sh` |
| Vulnerabilidades | nenhuma | `pnpm audit` |
| Headers de segurança | nenhum, e `X-Powered-By` exposto | `curl -I` |
| Fontes | self-hosted no build, zero requisição ao Google | ausência de `gstatic` no HTML |
| Links externos | 10 âncoras, todas com `rel="noreferrer noopener"` | HTML servido |
| Sinks de XSS | nenhum | `grep` por `dangerouslySetInnerHTML`, `eval`, `innerHTML` |

---

## P0 — Impede o site de funcionar ou de ser aceitável

### 1. Os frames não existem em produção
`build` é `next build` e as sequências estão no `.gitignore`.

O agravante que a auditoria de segurança encontrou: `poster.webp`,
`final-city.webp` e `final-city-mobile.webp` **não** estão no gitignore. Então o
deploy sem frames não parece quebrado. A página mostra o poster, segura 500vh de
scroll morto, e o handoff dispara no frame 236 do mesmo jeito, porque a timeline
é movida por scroll e não por estado de cache. **O site sobe sem o motivo dele
existir e ninguém percebe.**

Fix: versionar `public/cinematic/`, mais um `prebuild` que conta os arquivos e
falha se não houver 240 e 120.

Custo comparado: o pipeline no container pede **616 MB de disco temporário** e
360 encodes **a cada deploy**. Versionar custa **23 MB uma vez**.

### 2. A página baixa 16 MB sem o usuário rolar
Medido com `scrollY` em 0: 236 dos 240 frames, 16,12 MB, em 4,8 s.
`buildLoadPriority` devolve a fila inteira e o pump a drena na velocidade máxima
da concorrência. Num 4G de 5 Mbps são ~26 s de downlink saturado, cobrados de
quem abriu, leu o header e saiu.

Fix: separar a fila em urgente e cauda. Urgente é âncora, cabeça e janela do
playhead. A cauda só libera depois de o usuário rolar dentro da seção, com
concorrência menor.

### 3. O poster nunca aparece: o canvas cobre ele
`{!ready && <img poster>}` vem **antes** de `<CinematicCanvas>` no JSX, ambos
`absolute inset-0` sem z-index, então o canvas pinta por cima. Um contexto 2D
criado com `{ alpha: false }` nasce preto opaco por spec. Resultado: da montagem
até o primeiro bitmap decodificar, o usuário vê retângulo preto, não o frame 0.

Confiança alta, **não medido**: minha tentativa de confirmar deu falso positivo
porque o poster já estava desmontado no momento do teste. A ordem no JSX é fato;
o comportamento do `alpha: false` neste Chrome não foi provado.

Fix que elimina a dúvida em vez de depender dela: mover o `<img>` do poster para
**depois** do `<CinematicCanvas>` no JSX. Aí a ordem resolve sozinha,
independente da semântica de alpha.

Agravante: Safari não expõe `navigator.connection` nem `navigator.deviceMemory`,
então `resolveCinematicMode` devolve `full` lá independente da rede real, e a
janela preta se estende.

### 4. O favicon é o padrão do Next.js
`src/app/favicon.ico` nunca foi trocado. `/icon.png`, `/apple-icon.png` e
qualquer manifest dão 404. Toda aba aberta do site é marcada Next.js.

Fix: apagar o `favicon.ico` e gerar `src/app/icon.png` (512, fundo `#050607`) e
`apple-icon.png` (180) a partir de `public/brand/logo.png`.

---

## P1 — Comportamento errado, ou ausência que custa conversão

### 5. Um erro de cliente no cinematic apaga a página inteira
`CinematicExperience` é irmão das seis seções sob uma raiz sem error boundary.
Sem boundary, o Next troca o documento inteiro por "Application error". A ilha
toca `gsap.registerPlugin` no escopo do módulo, `createImageBitmap`,
`navigator.connection` e `canvas.getContext`.

Raio de alcance total por uma falha na única parte da página que não carrega
informação. Fix: boundary só na ilha, com `StaticCinematic` como fallback, que já
existe.

### 6. `sharp` é devDependency e o `/_next/image` precisa dele em runtime
O logo do header usa `next/image` com `src` string, então é otimizado por
requisição. Qualquer deploy com `pnpm install --prod` sobe, responde 200 na
página, e falha na primeira requisição do logo.

Fix melhor que mover a dependência: importar o logo estaticamente, o que mata a
rota dinâmica e serve de `/_next/static` com o header immutable já configurado.

### 7. Sem `og:image`
`twitter.card` está declarado `summary_large_image` sem imagem, então degrada
para `summary`. `final-city.webp` já está commitado e não é usado.

### 8. NaN atravessa quatro funções sem guarda
`getSceneProgress`, `getOverlayOpacity`, `fileIndexForFrame`,
`drawCoverDimensions`. `drawImage` com argumento não finito é no-op por spec: o
canvas para sem erro e sem log.

### 9. Falha de carga é engolida em silêncio absoluto
`catch { }` sem log. Um arquivo abandonado é coberto pelo `getNearest`, o que é o
comportamento certo com o silêncio errado. Combinado com o item 1, o estado
realista de produção é a sequência inteira em 404 sem uma linha em lugar nenhum.

### 10. Nada mede se os CTAs do WhatsApp são clicados
Dez âncoras de saída, nenhuma instrumentada. Um cinematic de 23 MB foi
construído sobre a hipótese de que converte, e a hipótese é hoje intestável.

Fix antes de qualquer script: UTM por posição no `text` do `wa.me`, que o
WhatsApp preserva no rascunho. Conversão contável na caixa de entrada, sem
cookie, sem consentimento, sem exposição de LGPD.

### 11. Sem type scale
Nenhum token em `globals.css`. Quatro tamanhos de display (52, 56, 58, 64), quatro
de corpo (15, 16, 17, 18), **oito** valores de tracking. No `ProductsSection`,
dois rótulos visualmente paralelos na mesma linha usam `0.28em` e `0.18em` sem
motivo. É a assinatura de template.

### 12. O caminho estático é uma cópia dessincronizada do principal
`StaticScene` usa um `<a>` escrito à mão em vez do `CtaLink`, perdendo o ícone e
todo o feedback de hover, e um headline de 56px que não existe em lugar nenhum.
Quem cai nesse caminho é quem pediu menos movimento ou está em conexão medida.

### 13. `cityReveal` come 33% do scroll sem uma palavra
72 de 218,5 unidades ponderadas, ~165vh de 500vh, sem overlay. Somado à intro,
já comprimida, **43% do cinematic não tem payoff textual**. O único retorno é o
trilho andando de 03/04 para 04/04.

Fix: `cityReveal.scrollWeight` de 1 para 0.5, ~85vh, com os 72 frames tocando
igual. Reconferir o `HANDOFF_FRAME_SPAN` na velocidade nova.

### 14. Cinco seções idênticas achatam a metade institucional
Mesmo esqueleto do `SectionShell` cinco vezes seguidas. Tirando o logo, os cards
translúcidos com lista de check e a lista de 11 itens com bullet são o vocabulário
de qualquer template escuro de SaaS. O material especificamente SHK (o 07:07, o
Pix, o fluxo comentário para Direct) vive só no texto, nunca na forma.

Fix por remoção, não por adição: tirar o parágrafo da direita de Technology e
Contact, e cortar a lista de 11 capacidades para as 5 ou 6 que diferenciam.

### 15. Sem CI
163 testes que só rodam quando alguém lembra.

---

## P2 — Segurança, compliance e manutenção

### 16. Zero headers de segurança, `X-Powered-By` exposto
Escopo honesto: não há sink de XSS, entrada de usuário, cookie ou formulário. Um
CSP compra pouco contra injeção hoje. O que ele compra é `frame-ancestors 'none'`
e um estopim para o dia em que colarem um pixel de marketing.

O risco concreto de clickjacking aqui não é sessão: é envelopar a página numa
casca e trocar o botão por outro número de WhatsApp. Fraude de marca contra uma
empresa cujo funil inteiro é um número de telefone.

O CSP precisa de `'unsafe-inline'` em script e style: o payload do React é
inline, e um nonce forçaria render dinâmico, matando o prerender. `img-src`
precisa de `data:` ou o grão do `GrainOverlay` some. Subir como
`Report-Only` por um deploy antes de virar a chave.

### 17. `ffmpeg-static` baixa 78 MB não verificados em todo install
O pnpm 9 roda lifecycle script por padrão. O binário não é coberto por hash do
lockfile: o `pnpm-lock.yaml` fixa só o wrapper de 8 KB. E o container de build
paga esse download por uma ferramenta que ele nunca invoca.

Fix: `"pnpm": { "onlyBuiltDependencies": [] }`. Nada nesta árvore precisa de
build step.

### 18. O 404 herda o canonical da home e emite robots contraditório
Duas diretivas de robots ao mesmo tempo, mais `canonical` e `og:url` apontando
para a raiz. Um 404 que se auto-canonicaliza para a home é sinal clássico de
soft-404. O corpo não tem header, footer nem CTA, e o skip link aponta para um
id que não existe naquela página.

Fix: mover `canonical` e `robots` do layout para a `page.tsx`, e escrever um
`not-found.tsx` com header, footer e CTA.

### 19. O site novo perde o link de política de privacidade que o atual tem
Estado real, medido: nenhum cookie, nenhum formulário, fontes self-hosted, então
nenhum IP de visitante chega ao Google. **Não é preciso banner de consentimento
hoje**, e colocar um seria pior que inútil.

O problema é a regressão: o site sendo substituído já tem o link, e este não.
Remover artefato de conformidade durante um redesign é o que chama atenção. E
sem página, no dia em que o analytics entrar, ela não vai ser escrita.

Junto: `SiteFooter` força `target="_blank"` em todo link, então uma rota interna
abriria em aba nova.

### 20. `robots.txt` e `sitemap.xml` dão 404
### 21. O deck de copy inteiro vai no bundle do cliente
### 22. O script de build espelha o config e ninguém compara os dois
### 23. `new Date().getFullYear()` grava o ano do build no HTML pré-renderizado
### 24. Duas convenções de fronteira de cena convivem
### 25. A redução de qualidade re-encoda os 240 do zero, até sete passadas
### 26. `.env.example` não existe, e preview sem a env se declara como produção

---

## P3 — Higiene

27. Sem JSON-LD Organization.
28. `SceneRail` mostra quatro segmentos iguais, mas só duas cenas têm texto.
29. `CasesSection` usa `py-40` para uma frase, então o vazio lê como build quebrado, não como escolha.
30. `CtaLink` não tem estado `active`: zero feedback de toque, e todo CTA é `<a>`, não `<button>`.
31. Valores de espaçamento a 2-6px da escala do Tailwind, cada um afinado à mão.
32. Headline mobile em 32px numa seção e 34px em outra.
33. `finalFrame` e `frameSets.*.frameCount` são cópias deriváveis.
34. `device.ts` reexporta `MOBILE_BREAKPOINT_PX` do config, invertendo a direção das camadas.
35. `fileIndexForFrame` monta nome de arquivo sem validar domínio.
36. Exports mortos: `brand.logoAlt`, `SceneRailProps.className`, `GrainOverlay.opacity`.
37. `pump` reconstrói a fila de 240 a cada quadro, mesmo com tudo residente.
38. `dispose()` não aborta os fetches em voo.

---

## Verificação ainda sem prova

Exige navegador em primeiro plano: aba em segundo plano congela o
`requestAnimationFrame` e invalida a medição.

39. O handoff é imperceptível. É a promessa central do projeto.
40. Resize redesenha sem deformar.
41. `prefers-reduced-motion` entrega o conteúdo.
42. Enquadramento 4:5 em aparelho real, e o caminho de degradação.
43. O heap volta ao normal depois do handoff.
44. Canvas nunca vazio sob rede lenta.
45. Confirmar o item 3: o poster aparece ou o canvas preto cobre?

---

## Camadas sem achado

Ditas uma vez, para não parecerem esquecidas. Links externos: as dez âncoras
`target="_blank"` carregam `rel="noreferrer noopener"`. Nenhum sink de XSS.
`next.config.ts` não alarga nada: sem `remotePatterns`, sem rewrites, sem
`ignoreBuildErrors`, sem `dangerouslyAllowSVG`. Fontes self-hosted no build, então
Google fora do ar afeta a máquina de build e não o visitante. Nenhuma
vulnerabilidade de dependência.
