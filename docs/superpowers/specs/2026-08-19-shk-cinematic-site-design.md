# SHK GROUP: site institucional scroll-driven

Data: 2026-08-19
Status: aprovado para planejamento

## 1. Objetivo

Construir o site institucional da SHK GROUP em torno de um vídeo cinematográfico
já finalizado. O vídeo não toca. O scroll do usuário controla diretamente qual
frame aparece, e ao fim da sequência o último frame vira o fundo permanente do
site. O usuário nunca percebe a troca entre canvas e imagem.

O site sai em inglês.

## 2. Inventário verificado

Tudo abaixo foi medido, não estimado.

### 2.1 Vídeo fonte

Existem dois arquivos do mesmo corte em `context/video/`. Conferi frame a frame
por contact sheet: o conteúdo é idêntico nos dois, mesma contagem, mesmo fps,
mesma duração. Muda só a qualidade.

| | `rafa3.mp4` (master) | `WhatsApp Video ... .mp4` |
| --- | --- | --- |
| Resolução | 1920x1080 | 1280x720 |
| Bitrate | 14.330 kbps | 1.814 kbps |
| Tamanho | 18.111.042 B | 2.436.349 B |
| Frame rate | 24/1 | 24/1 |
| Frames | 240 (0 a 239) | 240 (0 a 239) |
| Duração | 10.000 s | 10.000 s |
| Codec | h264, yuv420p | h264, yuv420p |

O pipeline usa `rafa3.mp4`. A cópia de WhatsApp fica no repositório apenas como
registro do que foi entregue primeiro, e não é lida por nada.

Como a contagem de frames é igual nos dois, a calibragem de cena da seção 5 vale
para qualquer um dos arquivos.

### 2.2 Toolchain

Node v20.20.2, npm 10.8.2, pnpm 9.15.9. `ffmpeg` não está instalado no sistema e
não há Homebrew formula instalada para ele. O pipeline usa `ffmpeg-static` e
`ffprobe-static` como devDependencies, que baixam o binário por npm. Isso torna a
extração de frames reproduzível em qualquer máquina do time sem instalação
manual.

O binário do `ffmpeg-static` foi compilado sem o filtro `drawtext`. Nenhuma etapa
do pipeline depende dele.

### 2.3 Marca

`logo_2d_branco.png` (400x224, PNG RGBA, branco sobre transparente), obtido de
shkgroup.com.br. É um monograma S angular em perspectiva isométrica, construído
por planos retos. A geometria dele conversa com as linhas neon do vídeo.

O ciano foi amostrado do frame 80 do master (2% dos pixels mais saturados dentro
da faixa ciano): `#66A1B3`, **hue 194°**. É dessaturado porque a cena é escura, e
o acento de interface deriva desse hue com croma alto.

A mesma amostragem na cópia de WhatsApp devolvia `#62AAB2`, hue 186°. A
compressão deslocou o matiz 8° para o verde. A paleta segue o master.

O site atual usa violeta (`#8b5cf6`, `#6d28d9`) e verde (`#10b981`). O spec
proíbe gradientes roxos genéricos de IA. A paleta nova rompe com a atual de
forma deliberada.

### 2.4 Fatos reais do negócio

Extraídos de shkgroup.com.br e usáveis sem invenção:

- SharkNews: newsletter diária de tecnologia, entrega às 7:07, gratuita, leitura
  de cinco minutos, cancelamento em um clique.
- AI Agent: opera em WhatsApp Business e Instagram. Responde, qualifica leads,
  conduz funil, lê áudio, responde comentário do Instagram, gera link de
  pagamento e Pix, agenda, salva contato, integra CRM, mantém memória de
  contexto. Ativação em 48 horas.
- Contato: `wa.me/5511912839594`, Instagram `@shkgroup.ia`.

Não usáveis: "+1.200 empresas", "247 agentes ativos", "99,2%", "847 conversas".
São afirmações do site atual que não tenho como verificar, e o spec proíbe
métrica não sustentada. Ficam fora.

## 3. Stack

| Camada | Escolha | Motivo |
| --- | --- | --- |
| Framework | Next.js 15, App Router | Exigido pelo spec |
| Linguagem | TypeScript strict | Exigido pelo spec |
| Estilo | Tailwind v4, config CSS-first | Projeto novo, sem convenção prévia |
| Animação | GSAP 3.13 + ScrollTrigger | Exigido pelo spec. ScrollTrigger é gratuito desde a 3.13 |
| Render | Canvas 2D | Exigido pelo spec. Sem Three.js |
| Testes | Vitest | Roda os testes de lógica pura sem browser |
| Pipeline | ffmpeg-static + sharp | Reprodutível, sem dependência de sistema |
| Package manager | pnpm | Já instalado |

Client Components só onde há API de browser: canvas, ScrollTrigger, matchMedia,
debug panel. Header, seções institucionais e footer são server-rendered.

## 4. Pipeline de frames

`scripts/build-frames.mjs`, executável por `pnpm frames`.

Etapas:

1. `ffprobe` lê metadados reais do vídeo e falha alto se divergirem do que está
   em `cinematic.config.ts`. Nenhum número é hardcodado em dois lugares.
2. `ffmpeg` extrai os 240 frames como PNG sem perda para um diretório temporário.
3. `sharp` converte para WebP em dois conjuntos.
4. O frame final é gravado separadamente com qualidade mais alta.
5. Um `manifest.json` registra contagem, dimensões, fps e bytes reais por
   conjunto. O runtime lê o manifest em vez de assumir.

Conjuntos gerados:

| Conjunto | Dimensão | Frames | Origem |
| --- | --- | --- | --- |
| `desktop/` | 1600x900 | 240 (todos) | master reescalado |
| `mobile/` | 864x1080 | 120 (1 a cada 2) | crop central 4:5 do master, sem upscale |
| `final-city.webp` | 1920x1080, q alta | 1 | frame 239 |
| `poster.webp` | 1600x900 | 1 | frame 0 |

O peso foi medido, não estimado: quatro frames representativos (20, 80, 140,
200) codificados em WebP e extrapolados para a sequência inteira.

| Resolução desktop | Média por frame | 240 frames |
| --- | --- | --- |
| 1920x1080 | 92.211 B | 21 MB |
| **1600x900** | **70.262 B** | **16 MB** |
| 1440x810 | 61.646 B | 14 MB |
| 1280x720 | 52.791 B | 12 MB |

1600x900 a 16 MB fica dentro do teto de 18 MB aprovado e cobre um viewport de
1440 px com folga. O conjunto mobile mede 51.458 B por frame, 5 MB no total.

WebP e não AVIF: durante o scrub o browser decodifica até 24 imagens por segundo,
e o decode de AVIF é significativamente mais lento que o de WebP. Peso menor não
compensa frame perdido.

Qualidade WebP inicial: 74 no desktop, 72 no mobile. O script imprime o total por
conjunto. Se o desktop passar de 18 MB, a qualidade cai em passos de 4 até caber,
e o script reporta o valor final usado.

## 5. Calibragem de cenas

Os ranges do prompt inicial eram conceituais. Os valores abaixo vieram de
inspeção frame a frame via contact sheets.

| Cena | Frames | Progress | O que acontece |
| --- | --- | --- | --- |
| Intro dive | 0 a 42 | 0.000 a 0.175 | Mergulho entre arranha-céus, sem elemento gráfico |
| SharkNews | 43 a 110 | 0.180 a 0.460 | Tubarão neon entra em 44, jornais materializam 64 a 104, pico em 80 |
| AI Agent | 110 a 168 | 0.460 a 0.700 | Tubarão vira circuito em 112, núcleo de IA e nós 136 a 165 |
| City reveal | 168 a 239 | 0.700 a 1.000 | Câmera sobe, cidade abre 171 a 186, panorâmica estável 186 em diante |

As janelas de overlay são separadas das janelas de cena, para garantir que dois
textos nunca dividem a tela:

| Overlay | Entrada | Hold | Saída |
| --- | --- | --- | --- |
| SharkNews | 52 a 68 | 68 a 96 | 96 a 106 |
| AI Agent | 118 a 132 | 132 a 156 | 156 a 166 |

Restam 12 frames de tela limpa entre a saída do primeiro e a entrada do segundo.

Toda essa tabela vive em `cinematic.config.ts` como números de frame absolutos.
Progress é derivado, nunca escrito à mão. Ajustar uma cena é editar um campo.

## 6. Arquitetura do cinematic

### 6.1 Container de scroll

Uma seção com altura `500vh` no desktop e `350vh` no mobile, ambas em config.
Dentro dela, um palco `position: sticky; top: 0; height: 100vh; overflow: hidden`.
O canvas preenche o palco. Sticky em vez de `ScrollTrigger.pin` evita que o GSAP
manipule o layout do documento e simplifica o comportamento no resize.

### 6.2 Timeline única

Uma `gsap.timeline({ scrollTrigger: { scrub: 0.3, ease: "none" } })` coordena
tudo. O índice do frame vem de um objeto proxy tweenado nessa timeline. Os
overlays são tweens posicionados na mesma timeline, em tempos derivados dos
frames da tabela acima. Um trigger só, tudo em fase.

O `onUpdate` do tween grava o frame alvo em um ref. Um `requestAnimationFrame`
separado lê esse ref e desenha. React não participa: nenhum `setState` roda por
frame. O único estado React do cinematic é booleano e muda poucas vezes (primeiro
frame pronto, handoff concluído).

Cleanup por `gsap.context()`, revertido no unmount, junto com
`cancelAnimationFrame` e desconexão do `ResizeObserver`.

### 6.3 Canvas

`aria-hidden="true"`, decorativo. Dimensionado por `devicePixelRatio` limitado a
2, para não custar 3x de fill rate em telas de celular sem ganho perceptível.

`drawCoverImage()` usa `drawCoverDimensions()`, uma função pura que recebe as
dimensões da imagem e do canvas e devolve o retângulo de destino que preserva
aspect ratio com comportamento equivalente a `object-fit: cover`. Nunca deforma.

Resize dispara recálculo do backing store e um redraw imediato do frame atual.

### 6.4 Carregamento progressivo

O cache tem dois níveis, porque encoded e decoded custam ordens de grandeza
diferentes de memória. Um WebP de 1280x720 pesa cerca de 60 KB no disco e 3,7 MB
como bitmap decodificado. Guardar 240 bitmaps decodificados passaria de 800 MB e
derrubaria qualquer celular.

| Nível | Estrutura | Escopo | Custo estimado |
| --- | --- | --- | --- |
| Encoded | `Map<number, Blob>` | todos os frames baixados | cerca de 15 MB no desktop |
| Decoded | `Map<number, ImageBitmap>` | janela LRU ao redor do playhead | 90 frames no desktop, 40 no mobile |

Os bitmaps vêm de `createImageBitmap(blob)`, e o despejo chama `.close()`
explicitamente, que devolve a memória de imediato em vez de esperar o GC. Como o
blob encoded permanece residente, redecodificar um frame despejado não custa
rede, apenas alguns milissegundos de decode.

Nenhum bitmap entra no nível decoded antes de `createImageBitmap` resolver, para
que o desenho nunca dispare decode síncrono no meio do scroll.

Ordem de prioridade, produzida por `buildLoadPriority()`:

1. frame 0
2. frame final (239)
3. frames 1 a 30
4. janela ao redor do playhead atual
5. primeiros frames da próxima cena
6. o restante, em ordem

Concorrência limitada a 6 requisições simultâneas. A fila é reordenada quando o
playhead se move, sem cancelar o que já está em voo.

Se o frame pedido não está carregado, `nearestLoadedFrame()` devolve o carregado
mais próximo e ele é desenhado. O canvas nunca fica vazio. Antes do primeiro
desenho, um `poster.webp` cobre o palco e sai por fade quando o frame 0 desenha.

O primeiro paint não espera a sequência. O HTML institucional está no DOM desde
o início e é indexável.

## 7. Handoff final

O ponto mais delicado do spec resolvido por construção, não por ajuste fino.

O scrub encerra exatamente no frame 239, e `final-city.webp` é esse mesmo frame
239. O crossfade acontece entre duas imagens idênticas, renderizadas com o mesmo
`cover`, no mesmo viewport. Não existe diferença para o olho detectar. O fade de
200 ms serve apenas para absorver diferença de decode entre canvas e `<img>`.

Concluído o fade, todos os `ImageBitmap` são fechados, o mapa de blobs é
esvaziado e o canvas é redimensionado para zero. A memória do cinematic volta
inteira para o sistema enquanto o usuário lê o site.

Se o usuário rolar de volta para cima, a sequência recarrega pela mesma fila de
prioridade, partindo do frame sob o playhead.

`PersistentCityBackground` é `position: fixed; inset: 0`, montado desde o carregamento
inicial atrás do cinematic com opacidade 0, e subindo para 1 no handoff. Camadas,
de baixo para cima:

1. `final-city.webp` em `object-fit: cover`
2. scrim escuro
3. gradiente vertical (topo e base)
4. vinheta radial
5. grão

Nenhuma seção institucional usa fundo totalmente opaco. A cidade permanece
legível através do site inteiro.

## 8. Sistema visual

### 8.1 Paleta

```
--ink-900   #050607   base da página
--ink-800   #090C0F   superfície elevada
--ink-700   #10151A   borda de superfície
--paper     #F5F7F8   texto primário
--paper-dim rgba(245, 247, 248, 0.62)   texto secundário

--accent      #40C1E7   hue 194, derivado do ciano do master
--accent-dim  #1E6F8C   bordas e estados inativos
--accent-glow rgba(64, 193, 231, 0.14)
```

Superfície translúcida, usada com parcimônia:

```css
background: rgba(5, 8, 12, 0.58);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

### 8.2 Tipografia

Títulos em Space Grotesk 600/700: os terminais angulares dele ecoam a geometria
do monograma. Corpo em Archivo 400/500. Eyebrows e o painel de debug em
JetBrains Mono 500, caixa alta, tracking largo. O registro de HUD monoespaçado
entrega o clima cinematográfico sem recorrer a neon ou a estética de jogo.

Archivo no lugar de Inter: Inter é a fonte padrão de praticamente toda landing
page de IA, e entrega o texto como template antes do leitor ler a primeira
palavra. Archivo tem densidade equivalente e nenhuma dessa bagagem.

Fontes carregadas por `next/font/google`, com subset latin e `display: swap`.

### 8.3 Grão e vinheta

Com o master de 14,3 Mbps o ruído de compressão praticamente desaparece, então o
grão deixa de ser máscara e passa a ser escolha estética. Ele fica, com
intensidade menor: textura de ruído de 128x128 em `mix-blend-mode: overlay` a
0.035 de opacidade, como camada estática sobre o canvas e sobre a cidade fixa,
igual nos dois. Sendo contínua entre cinematic e site, ela reforça o handoff.

A vinheta permanece pelo motivo original, que é dirigir o olho para o centro do
quadro e dar queda nas bordas onde o texto encosta.

### 8.4 Indicador de cena

Um trilho vertical de quatro segmentos na borda direita do palco marca em qual
das quatro cenas o scroll está, com o segmento ativo em acento. É o único
elemento de HUD do cinematic. Ele resolve um problema real: sem referência de
posição, uma seção de 500vh deixa o usuário sem saber quanto falta. Sai de cena
junto com o handoff.

Os blocos de texto de SharkNews e AI Agent ocupam a mesma âncora, inferior
esquerda. Durante o scroll o olho fica parado enquanto o mundo muda atrás. Mover
o bloco entre as duas cenas quebraria a leitura.

## 9. Estrutura do site institucional

Ordem das seções, todas rolando sobre a cidade fixa:

1. `SiteHeader`: logo, navegação, CTA
2. `InstitutionalIntro`
3. `ProductsSection`: SharkNews e AI Agent
4. `TechnologySection`
5. `AboutSection`
6. `CasesSection`
7. `ContactSection`
8. `SiteFooter`

Toda string em inglês vive em `src/lib/content/site-content.ts`. Nenhuma copy
hardcodada em componente. Isso mantém a revisão de texto em um arquivo só e deixa
i18n possível depois sem refatorar componente.

`CasesSection` sai com slot marcado e sem número. Casos, clientes, métricas,
depoimentos e certificações ficam de fora até existir material verificável.

CTAs apontam para `wa.me/5511912839594`. São `<a>` reais, com foco visível e
label acessível.

## 10. Mobile

Desktop recebe a experiência completa. Mobile recebe um conjunto próprio.

O master de 1080p resolve o problema que existia com a cópia de 720p. Um crop
central 4:5 do master mede 864x1080 e é gravado nessa dimensão, sem nenhum
upscale. Um iPhone de 390 pt com dpr 3 pede 1170 px de largura física; o frame
entrega 864 e o browser amplia 1,35 vez, contra as quase cinco vezes que o
caminho anterior exigia.

O palco sangra o viewport inteiro no mobile, igual ao desktop. A spec chegou a
prever um palco 4:5 com queda em gradiente para o fundo abaixo, e isso foi
abandonado: o handoff só é imperceptível se o canvas e o fundo fixo tiverem
exatamente o mesmo enquadramento. Um palco em faixa sobre um fundo sangrado
mostra duas escalas diferentes da mesma cidade no instante da troca, que é
justamente o defeito que este projeto existe para evitar.

Consequência: `final-city.webp` deixa de ser um arquivo e passa a ser dois.
`final-city.webp` em 1920x1080 para 16:9, `final-city-mobile.webp` em 864x1080
para o recorte 4:5. O `PersistentCityBackground` usa `<picture>` com `media`, e
o browser baixa só o que vai usar. A fronteira dos dois é 768 px, o mesmo número
que escolhe o conjunto de frames, e ele vive em `cinematic.config.ts` para não
existir escrito em dois lugares.

O corte 4:5 mais o `cover` num aparelho alto descarta bastante largura. A
composição aguenta porque tudo que importa na sequência está centralizado: o
tubarão, o núcleo de IA e o ponto de fuga da cidade. Ainda assim precisa de
validação em device real.

Sequência mobile: 120 frames, 5 MB, altura de scroll 350vh.

Degradação: se `navigator.connection.saveData` estiver ativo ou `effectiveType`
indicar 2g/3g, o cinematic não carrega a sequência. A página mostra a cidade
final direto e as seções institucionais funcionam normalmente.

## 11. Reduced motion

Com `prefers-reduced-motion: reduce`, o scrub não é montado. A seção cinematic
colapsa para uma altura de viewport, exibe o estado final da cidade, e os
overlays de SharkNews e AI Agent aparecem como blocos estáticos legíveis. O
conteúdo institucional inteiro segue acessível por scroll normal. Nenhuma
informação existe apenas na versão animada.

## 12. Debug mode

Ativado por `?cinematicDebug=true`. Desligado por padrão em qualquer ambiente.

Exibe progress em porcentagem, frame atual sobre total, cena ativa, frames
carregados, bytes residentes em cache e fps do loop de desenho. Serve para
calibrar frame a frame depois, que é justamente o que a tabela da seção 5 vai
precisar quando você revisar o resultado em tela.

## 13. Testes

Vitest sobre lógica pura, sem browser:

| Função | O que é verificado |
| --- | --- |
| `frameFromProgress` | mapeamento correto nas bordas, clamp em 0 e no último frame, arredondamento |
| `clampFrame` | limites inferior e superior, entrada fora de faixa |
| `getSceneProgress` | 0 no início da cena, 1 no fim, clamp fora da cena |
| `getOverlayOpacity` | rampa de entrada, platô no hold, rampa de saída, zero fora da janela |
| `drawCoverDimensions` | imagem mais larga que o canvas, mais alta, mesma proporção, ausência de distorção |
| `buildLoadPriority` | ordem da prioridade, ausência de índice duplicado, cobertura de todos os frames |
| `nearestLoadedFrame` | empate resolvido, cache vazio, alvo já carregado |
| `framesToEvict` | mantém a janela ao redor do playhead, despeja o mais distante primeiro, respeita o teto, nunca despeja o frame atual |

Sem teste escrito só para levantar cobertura.

## 14. Estrutura de arquivos

```
scripts/
  build-frames.mjs
public/
  cinematic/
    desktop/frame-0000.webp .. frame-0239.webp
    mobile/frame-0000.webp .. frame-0119.webp
    final-city.webp
    poster.webp
    manifest.json
  brand/logo.png
  textures/grain.png
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    cinematic/
      CinematicExperience.tsx
      CinematicCanvas.tsx
      CinematicOverlay.tsx
      SharkNewsScene.tsx
      AiAgentScene.tsx
      CinematicDebugPanel.tsx
    background/
      PersistentCityBackground.tsx
      GrainOverlay.tsx
    layout/
      SiteHeader.tsx
      SiteFooter.tsx
    sections/
      InstitutionalIntro.tsx
      ProductsSection.tsx
      TechnologySection.tsx
      AboutSection.tsx
      CasesSection.tsx
      ContactSection.tsx
    ui/
      Eyebrow.tsx
      CtaLink.tsx
      SectionShell.tsx
  lib/
    cinematic/
      cinematic.config.ts
      frame-math.ts
      draw-cover.ts
      frame-loader.ts
      use-frame-sequence.ts
      use-cinematic-timeline.ts
      use-cinematic-debug.ts
    content/site-content.ts
    env/device.ts
tests/
  frame-math.test.ts
  draw-cover.test.ts
  frame-loader.test.ts
```

Desvio em relação à estrutura sugerida no prompt inicial: não existe
`FinalCityTransition.tsx`. Com o handoff resolvido por frame idêntico, a
transição virou uma troca de opacidade de três linhas dentro de
`CinematicExperience`. Um arquivo para isso seria indireção sem conteúdo.

## 15. Critérios de aceite

- [ ] Pipeline lê `rafa3.mp4`, não a cópia de WhatsApp
- [ ] Metadados do vídeo lidos do arquivo, não assumidos
- [ ] `pnpm frames` regenera as duas sequências e o manifest do zero
- [ ] Scroll controla o frame nos dois sentidos, com scrub suave
- [ ] SharkNews aparece na janela 52 a 106 e some antes do AI Agent
- [ ] AI Agent aparece na janela 118 a 166
- [ ] Nunca há dois overlays visíveis ao mesmo tempo
- [ ] Nenhum áudio no projeto, nem no vídeo processado
- [ ] Primeiro paint não espera a sequência
- [ ] Canvas mantém aspect ratio em qualquer viewport
- [ ] Canvas nunca aparece vazio
- [ ] Transição para a cidade final é imperceptível
- [ ] Cidade permanece fixa atrás de todo o site
- [ ] Seções institucionais rolam sobre a cidade sem escondê-la
- [ ] Resize no desktop redesenha corretamente
- [ ] `prefers-reduced-motion` entrega o conteúdo sem o scrub
- [ ] Mobile tem sequência própria e caminho de degradação
- [ ] `?cinematicDebug=true` mostra progress, frame, cena e frames carregados
- [ ] `gsap.context()` revertido, rAF cancelado, `ResizeObserver` desconectado no unmount
- [ ] Cache decoded respeita o teto e fecha cada `ImageBitmap` no despejo (`framesToEvict`)
- [ ] Memória do cinematic é devolvida após o handoff
- [ ] `tsc --noEmit` limpo em strict, sem `any`
- [ ] Testes da seção 13 passando

## 16. Fora de escopo

Casos, clientes, métricas e depoimentos. Tabela de planos e preços. Formulário de
inscrição da newsletter com backend (o CTA aponta para o WhatsApp). Painel
administrativo. Analytics. Internacionalização em runtime (as strings estão
centralizadas, mas só há inglês).

## 17. Limitações conhecidas

O enquadramento no mobile precisa de validação em device real. O corte 4:5
descarta 45% da largura do quadro, e o `cover` num aparelho alto tira mais um
tanto. A cena da cidade panorâmica é a que mais depende de largura e é a que
mais sofre. Se ficar apertado demais, o caminho é gerar um conjunto mobile com
recorte próprio por cena, o que o pipeline aceita sem mudança de arquitetura,
mas custa uma passada de arte que não está no escopo atual.

A sequência desktop pesa 16 MB. Ninguém baixa os 16 MB para ver a página, porque
o carregamento é por prioridade e o primeiro paint não espera nada, mas uma
visita que role o cinematic inteiro transfere esse volume. Vale medir em campo
antes de assumir que está bom.

O `manifest.json` é a única fonte de verdade sobre a sequência em runtime. Se
alguém regenerar os frames com parâmetro diferente e não versionar o manifest
junto, o runtime desenha frames errados sem reclamar. O script grava os dois na
mesma execução para reduzir esse risco, mas ele existe.
