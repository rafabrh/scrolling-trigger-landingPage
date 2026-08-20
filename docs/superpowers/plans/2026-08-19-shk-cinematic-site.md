# SHK Cinematic Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site institucional da SHK GROUP onde o scroll controla frame a frame uma sequência cinematográfica em Canvas, e o frame final vira o fundo fixo do site.

**Architecture:** Uma seção de 500vh com palco sticky. Uma única `gsap.timeline` com ScrollTrigger em scrub coordena índice de frame e overlays. O desenho acontece em `requestAnimationFrame` lendo refs, sem estado React no caminho quente. Frames vêm de um cache em dois níveis (blob encoded para todos, `ImageBitmap` decodificado em janela LRU). O scrub encerra no frame 239 e o fundo fixo é esse mesmo frame, então o handoff é um crossfade entre imagens idênticas.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript strict, Tailwind v4, GSAP 3.13 + ScrollTrigger, Canvas 2D, Vitest, ffmpeg-static + sharp.

**Spec:** `docs/superpowers/specs/2026-08-19-shk-cinematic-site-design.md`

## Global Constraints

Estes valores valem para todas as tasks. Copiados da spec, sem arredondar.

- Vídeo fonte: `context/video/rafa3.mp4`. 1920x1080, 24 fps, **240 frames (índices 0 a 239)**, 10.000 s, h264 yuv420p. Nunca ler a cópia de WhatsApp.
- Cenas em frames absolutos: intro `0..42`, sharknews `43..110` (pico 80), aiAgent `110..168` (pico 140), cityReveal `168..239`.
- Janelas de overlay: SharkNews entrada `52..68`, hold `68..96`, saída `96..106`. AI Agent entrada `118..132`, hold `132..156`, saída `156..166`.
- Frame do handoff e do fundo fixo: **239**, o mesmo nos dois.
- Conjunto desktop: 1600x900, 240 frames, WebP q74. Conjunto mobile: 864x1080 (crop central 4:5), 120 frames (1 a cada 2), WebP q72.
- Altura de scroll: 500vh desktop, 350vh mobile. Scrub 0.3, `ease: "none"`.
- Paleta: `#050607`, `#090C0F`, `#10151A`, texto `#F5F7F8`, acento `#40C1E7` (hue 194), acento dim `#1E6F8C`.
- Tipografia: Space Grotesk (títulos 600/700), Archivo (corpo 400/500), JetBrains Mono (eyebrows e debug 500).
- Copy do site em **inglês**. Toda string em `src/lib/content/site-content.ts`, nenhuma hardcodada em componente.
- Proibido: áudio de qualquer tipo, Three.js, `any` sem justificativa, métricas ou casos inventados, `setState` por frame durante scroll.
- Contato real: `https://wa.me/5511912839594`, Instagram `@shkgroup.ia`.
- Cada task termina com `pnpm typecheck` e `pnpm test` limpos antes do commit.

---

### Task 1: Scaffold do projeto e tokens de design

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `public/brand/logo.png` (copiar de `design-canvas/shk-logo.png`)

**Interfaces:**
- Consumes: nada.
- Produces: scripts `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm frames`. Variáveis CSS `--ink-900`, `--ink-800`, `--ink-700`, `--paper`, `--paper-dim`, `--accent`, `--accent-dim`, `--accent-glow`. Fontes expostas como `--font-display`, `--font-body`, `--font-mono`.

- [ ] **Step 1: Criar o projeto**

```bash
cd /Users/rafa/Desktop/Arsenal/scrolling-trigger-landingPage
pnpm dlx create-next-app@latest . --ts --tailwind --app --src-dir --import-alias "@/*" --no-eslint --use-pnpm --yes
```

Se o comando reclamar do diretório não vazio, aceite manter os arquivos existentes (`context/`, `docs/`, `design-canvas/`, `.gitignore`).

- [ ] **Step 2: Instalar as dependências restantes**

```bash
pnpm add gsap@^3.13.0
pnpm add -D vitest@^3 @vitest/coverage-v8 ffmpeg-static ffprobe-static sharp typescript
```

- [ ] **Step 3: Endurecer o TypeScript**

Em `tsconfig.json`, dentro de `compilerOptions`:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "exactOptionalPropertyTypes": true
}
```

- [ ] **Step 4: Adicionar os scripts**

Em `package.json`, no bloco `scripts`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "frames": "node scripts/build-frames.mjs"
}
```

- [ ] **Step 5: Configurar o Vitest**

Criar `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 6: Escrever os tokens e as fontes**

Substituir `src/app/globals.css` inteiro:

```css
@import "tailwindcss";

:root {
  --ink-900: #050607;
  --ink-800: #090C0F;
  --ink-700: #10151A;
  --paper: #F5F7F8;
  --paper-dim: rgba(245, 247, 248, 0.62);

  --accent: #40C1E7;
  --accent-dim: #1E6F8C;
  --accent-glow: rgba(64, 193, 231, 0.14);

  --surface: rgba(5, 8, 12, 0.58);
  --surface-border: rgba(255, 255, 255, 0.08);
}

@theme inline {
  --color-ink-900: var(--ink-900);
  --color-ink-800: var(--ink-800);
  --color-ink-700: var(--ink-700);
  --color-paper: var(--paper);
  --color-accent: var(--accent);
  --color-accent-dim: var(--accent-dim);
  --font-display: var(--font-space-grotesk);
  --font-body: var(--font-archivo);
  --font-mono: var(--font-jetbrains-mono);
}

html {
  scroll-behavior: auto;
}

body {
  margin: 0;
  background: var(--ink-900);
  color: var(--paper);
  font-family: var(--font-body), "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

`scroll-behavior: auto` é deliberado. `smooth` briga com o scrub do ScrollTrigger.

- [ ] **Step 7: Carregar as fontes no layout**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Space_Grotesk, Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SHK Group',
  description:
    'AI agents, software and digital products for companies whose sales operation runs slower than their demand.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${archivo.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Copiar o logo**

```bash
mkdir -p public/brand
cp design-canvas/shk-logo.png public/brand/logo.png
```

- [ ] **Step 9: Verificar**

```bash
pnpm typecheck && pnpm build
```

Esperado: os dois passam. `pnpm test` ainda não tem teste e sai com aviso de "no test files", o que é esperado nesta task.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js com TypeScript strict, tokens e fontes"
```

---

### Task 2: Configuração central do cinematic

**Files:**
- Create: `src/lib/cinematic/cinematic.config.ts`
- Create: `tests/cinematic-config.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type SceneKey = 'intro' | 'sharknews' | 'aiAgent' | 'cityReveal'`
  - `interface SceneRange { startFrame: number; endFrame: number; peakFrame?: number }`
  - `interface OverlayWindow { inStart: number; inEnd: number; outStart: number; outEnd: number }`
  - `interface FrameSet { dir: string; width: number; height: number; frameCount: number; frameStep: number }`
  - `const CINEMATIC` com `frameCount`, `fps`, `finalFrame`, `scrub`, `scrollHeightVh`, `scenes`, `overlays`, `frameSets`, `cache`.

- [ ] **Step 1: Escrever o teste que trava os invariantes**

`tests/cinematic-config.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CINEMATIC, SCENE_ORDER } from '@/lib/cinematic/cinematic.config';

describe('CINEMATIC config', () => {
  it('descreve o vídeo real', () => {
    expect(CINEMATIC.frameCount).toBe(240);
    expect(CINEMATIC.fps).toBe(24);
    expect(CINEMATIC.finalFrame).toBe(CINEMATIC.frameCount - 1);
  });

  it('cobre a sequência inteira sem buraco entre cenas', () => {
    const ranges = SCENE_ORDER.map((key) => CINEMATIC.scenes[key]);
    expect(ranges[0]!.startFrame).toBe(0);
    expect(ranges[ranges.length - 1]!.endFrame).toBe(CINEMATIC.finalFrame);
    for (let i = 1; i < ranges.length; i += 1) {
      expect(ranges[i]!.startFrame).toBeLessThanOrEqual(ranges[i - 1]!.endFrame + 1);
      expect(ranges[i]!.startFrame).toBeGreaterThan(ranges[i - 1]!.startFrame);
    }
  });

  it('mantém cada peakFrame dentro da sua cena', () => {
    for (const key of SCENE_ORDER) {
      const scene = CINEMATIC.scenes[key];
      if (scene.peakFrame === undefined) continue;
      expect(scene.peakFrame).toBeGreaterThanOrEqual(scene.startFrame);
      expect(scene.peakFrame).toBeLessThanOrEqual(scene.endFrame);
    }
  });

  it('nunca deixa dois overlays visíveis ao mesmo tempo', () => {
    const { sharknews, aiAgent } = CINEMATIC.overlays;
    expect(sharknews.outEnd).toBeLessThan(aiAgent.inStart);
  });

  it('ordena os quatro marcos de cada janela de overlay', () => {
    for (const w of Object.values(CINEMATIC.overlays)) {
      expect(w.inStart).toBeLessThan(w.inEnd);
      expect(w.inEnd).toBeLessThanOrEqual(w.outStart);
      expect(w.outStart).toBeLessThan(w.outEnd);
      expect(w.outEnd).toBeLessThanOrEqual(CINEMATIC.finalFrame);
    }
  });

  it('deriva a contagem de frames de cada conjunto pelo passo', () => {
    for (const set of Object.values(CINEMATIC.frameSets)) {
      expect(set.frameCount).toBe(Math.ceil(CINEMATIC.frameCount / set.frameStep));
    }
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `pnpm test tests/cinematic-config.test.ts`
Expected: FAIL, o módulo `@/lib/cinematic/cinematic.config` não existe.

- [ ] **Step 3: Escrever a configuração**

`src/lib/cinematic/cinematic.config.ts`:

```ts
/**
 * Fronteira entre os conjuntos de frame. Vive aqui porque três lugares
 * precisam do mesmo número: a escolha do conjunto em TypeScript, o
 * `media` do fundo, e o `md` do Tailwind.
 */
export const MOBILE_BREAKPOINT_PX = 768;

export type SceneKey = 'intro' | 'sharknews' | 'aiAgent' | 'cityReveal';

export const SCENE_ORDER: readonly SceneKey[] = ['intro', 'sharknews', 'aiAgent', 'cityReveal'] as const;

export interface SceneRange {
  readonly startFrame: number;
  readonly endFrame: number;
  readonly peakFrame?: number;
}

/**
 * Uma janela de overlay em frames absolutos. A opacidade sobe de inStart a
 * inEnd, fica em 1 até outStart, e desce até outEnd.
 */
export interface OverlayWindow {
  readonly inStart: number;
  readonly inEnd: number;
  readonly outStart: number;
  readonly outEnd: number;
}

export interface FrameSet {
  /** Caminho sob /public, sem barra final. */
  readonly dir: string;
  readonly width: number;
  readonly height: number;
  /** Quantos arquivos existem no conjunto. */
  readonly frameCount: number;
  /** 1 = todo frame do vídeo. 2 = um a cada dois. */
  readonly frameStep: number;
  readonly quality: number;
}

export const CINEMATIC = {
  source: 'context/video/rafa3.mp4',
  frameCount: 240,
  fps: 24,
  finalFrame: 239,
  sourceWidth: 1920,
  sourceHeight: 1080,

  scrub: 0.3,
  scrollHeightVh: { desktop: 500, mobile: 350 },

  scenes: {
    intro: { startFrame: 0, endFrame: 42 },
    sharknews: { startFrame: 43, endFrame: 110, peakFrame: 80 },
    aiAgent: { startFrame: 110, endFrame: 168, peakFrame: 140 },
    cityReveal: { startFrame: 168, endFrame: 239 },
  } satisfies Record<SceneKey, SceneRange>,

  overlays: {
    sharknews: { inStart: 52, inEnd: 68, outStart: 96, outEnd: 106 },
    aiAgent: { inStart: 118, inEnd: 132, outStart: 156, outEnd: 166 },
  } satisfies Record<'sharknews' | 'aiAgent', OverlayWindow>,

  frameSets: {
    desktop: {
      dir: '/cinematic/desktop',
      width: 1600,
      height: 900,
      frameCount: 240,
      frameStep: 1,
      quality: 74,
    },
    mobile: {
      dir: '/cinematic/mobile',
      width: 864,
      height: 1080,
      frameCount: 120,
      frameStep: 2,
      quality: 72,
    },
  } satisfies Record<'desktop' | 'mobile', FrameSet>,

  cache: {
    /** Teto de ImageBitmap decodificados residentes por conjunto. */
    maxDecoded: { desktop: 90, mobile: 40 },
    /** Requisições de rede simultâneas. */
    concurrency: 6,
    /** Raio da janela de pré-carga ao redor do playhead. */
    lookAround: 24,
  },

  assets: {
    finalCity: '/cinematic/final-city.webp',
    poster: '/cinematic/poster.webp',
    manifest: '/cinematic/manifest.json',
  },

  /** Duração do crossfade canvas -> cidade fixa, em segundos. */
  handoffFadeSeconds: 0.2,
} as const;
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `pnpm test tests/cinematic-config.test.ts`
Expected: PASS, seis testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cinematic/cinematic.config.ts tests/cinematic-config.test.ts
git commit -m "Configuracao central do cinematic com as cenas calibradas"
```

---

### Task 3: Matemática de frame

**Files:**
- Create: `src/lib/cinematic/frame-math.ts`
- Create: `tests/frame-math.test.ts`

**Interfaces:**
- Consumes: `SceneKey`, `SceneRange`, `OverlayWindow`, `SCENE_ORDER` da Task 2.
- Produces:
  - `clampFrame(frame: number, frameCount: number): number`
  - `frameFromProgress(progress: number, frameCount: number): number`
  - `getSceneProgress(frame: number, scene: SceneRange): number`
  - `getOverlayOpacity(frame: number, window: OverlayWindow): number`
  - `sceneAtFrame(frame: number, scenes: Record<SceneKey, SceneRange>): SceneKey`
  - `fileIndexForFrame(frame: number, frameStep: number): number`

- [ ] **Step 1: Escrever os testes**

`tests/frame-math.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  clampFrame,
  frameFromProgress,
  getSceneProgress,
  getOverlayOpacity,
  sceneAtFrame,
  fileIndexForFrame,
} from '@/lib/cinematic/frame-math';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';

describe('clampFrame', () => {
  it('deixa passar um frame dentro da faixa', () => {
    expect(clampFrame(100, 240)).toBe(100);
  });
  it('prende no piso', () => {
    expect(clampFrame(-5, 240)).toBe(0);
  });
  it('prende no teto', () => {
    expect(clampFrame(999, 240)).toBe(239);
  });
  it('arredonda fracionário', () => {
    expect(clampFrame(10.4, 240)).toBe(10);
    expect(clampFrame(10.6, 240)).toBe(11);
  });
  it('devolve 0 quando não há frame', () => {
    expect(clampFrame(3, 0)).toBe(0);
  });
});

describe('frameFromProgress', () => {
  it('mapeia 0 no primeiro frame', () => {
    expect(frameFromProgress(0, 240)).toBe(0);
  });
  it('mapeia 1 no último frame', () => {
    expect(frameFromProgress(1, 240)).toBe(239);
  });
  it('mapeia o meio no meio', () => {
    expect(frameFromProgress(0.5, 240)).toBe(120);
  });
  it('prende fora da faixa nos dois lados', () => {
    expect(frameFromProgress(-0.4, 240)).toBe(0);
    expect(frameFromProgress(1.7, 240)).toBe(239);
  });
  it('não pula frame em nenhum ponto do percurso', () => {
    const seen = new Set<number>();
    for (let i = 0; i <= 2400; i += 1) seen.add(frameFromProgress(i / 2400, 240));
    expect(seen.size).toBe(240);
  });
});

describe('getSceneProgress', () => {
  const scene = { startFrame: 43, endFrame: 110 };

  it('devolve 0 no primeiro frame da cena', () => {
    expect(getSceneProgress(43, scene)).toBe(0);
  });
  it('devolve 1 no último frame da cena', () => {
    expect(getSceneProgress(110, scene)).toBe(1);
  });
  it('devolve o ponto proporcional no meio', () => {
    expect(getSceneProgress(76.5, scene)).toBeCloseTo(0.5, 5);
  });
  it('prende fora da cena', () => {
    expect(getSceneProgress(10, scene)).toBe(0);
    expect(getSceneProgress(200, scene)).toBe(1);
  });
  it('devolve 1 quando a cena tem um frame só', () => {
    expect(getSceneProgress(43, { startFrame: 43, endFrame: 43 })).toBe(1);
  });
});

describe('getOverlayOpacity', () => {
  const w = { inStart: 52, inEnd: 68, outStart: 96, outEnd: 106 };

  it('fica invisível antes da entrada', () => {
    expect(getOverlayOpacity(0, w)).toBe(0);
    expect(getOverlayOpacity(52, w)).toBe(0);
  });
  it('sobe pela rampa de entrada', () => {
    expect(getOverlayOpacity(60, w)).toBeCloseTo(0.5, 5);
  });
  it('fica cheio no hold', () => {
    expect(getOverlayOpacity(68, w)).toBe(1);
    expect(getOverlayOpacity(80, w)).toBe(1);
    expect(getOverlayOpacity(96, w)).toBe(1);
  });
  it('desce pela rampa de saída', () => {
    expect(getOverlayOpacity(101, w)).toBeCloseTo(0.5, 5);
  });
  it('fica invisível depois da saída', () => {
    expect(getOverlayOpacity(106, w)).toBe(0);
    expect(getOverlayOpacity(239, w)).toBe(0);
  });
  it('nunca deixa os dois overlays visíveis ao mesmo tempo', () => {
    const { sharknews, aiAgent } = CINEMATIC.overlays;
    for (let f = 0; f <= CINEMATIC.finalFrame; f += 1) {
      const both = getOverlayOpacity(f, sharknews) > 0 && getOverlayOpacity(f, aiAgent) > 0;
      expect(both).toBe(false);
    }
  });
});

describe('sceneAtFrame', () => {
  it('identifica cada cena pelo seu frame de pico', () => {
    expect(sceneAtFrame(10, CINEMATIC.scenes)).toBe('intro');
    expect(sceneAtFrame(80, CINEMATIC.scenes)).toBe('sharknews');
    expect(sceneAtFrame(140, CINEMATIC.scenes)).toBe('aiAgent');
    expect(sceneAtFrame(200, CINEMATIC.scenes)).toBe('cityReveal');
  });
  it('resolve a fronteira em favor da cena que começa', () => {
    expect(sceneAtFrame(110, CINEMATIC.scenes)).toBe('aiAgent');
    expect(sceneAtFrame(168, CINEMATIC.scenes)).toBe('cityReveal');
  });
  it('prende fora da faixa', () => {
    expect(sceneAtFrame(-5, CINEMATIC.scenes)).toBe('intro');
    expect(sceneAtFrame(9999, CINEMATIC.scenes)).toBe('cityReveal');
  });
});

describe('fileIndexForFrame', () => {
  it('é identidade quando o passo é 1', () => {
    expect(fileIndexForFrame(137, 1)).toBe(137);
  });
  it('divide pelo passo quando o conjunto é reduzido', () => {
    expect(fileIndexForFrame(0, 2)).toBe(0);
    expect(fileIndexForFrame(1, 2)).toBe(0);
    expect(fileIndexForFrame(2, 2)).toBe(1);
    expect(fileIndexForFrame(239, 2)).toBe(119);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test tests/frame-math.test.ts`
Expected: FAIL, `@/lib/cinematic/frame-math` não existe.

- [ ] **Step 3: Implementar**

`src/lib/cinematic/frame-math.ts`:

```ts
import { SCENE_ORDER, type OverlayWindow, type SceneKey, type SceneRange } from './cinematic.config';

/** Prende um índice de frame em [0, frameCount - 1] e arredonda. */
export function clampFrame(frame: number, frameCount: number): number {
  if (frameCount <= 0) return 0;
  const rounded = Math.round(frame);
  if (rounded < 0) return 0;
  const last = frameCount - 1;
  return rounded > last ? last : rounded;
}

/** Converte o progresso 0..1 do ScrollTrigger em índice de frame. */
export function frameFromProgress(progress: number, frameCount: number): number {
  if (frameCount <= 0) return 0;
  return clampFrame(progress * (frameCount - 1), frameCount);
}

/** Posição 0..1 de um frame dentro de uma cena. Preso fora dela. */
export function getSceneProgress(frame: number, scene: SceneRange): number {
  const span = scene.endFrame - scene.startFrame;
  if (span <= 0) return 1;
  const raw = (frame - scene.startFrame) / span;
  if (raw < 0) return 0;
  return raw > 1 ? 1 : raw;
}

/**
 * Opacidade 0..1 de um overlay: rampa de entrada, platô, rampa de saída.
 * Zero fora da janela.
 */
export function getOverlayOpacity(frame: number, window: OverlayWindow): number {
  if (frame <= window.inStart || frame >= window.outEnd) return 0;
  if (frame < window.inEnd) {
    const span = window.inEnd - window.inStart;
    return span <= 0 ? 1 : (frame - window.inStart) / span;
  }
  if (frame <= window.outStart) return 1;
  const span = window.outEnd - window.outStart;
  return span <= 0 ? 0 : 1 - (frame - window.outStart) / span;
}

/**
 * Qual cena está ativa num frame. Numa fronteira compartilhada vence a cena
 * que começa, porque é ela que o usuário está entrando.
 */
export function sceneAtFrame(frame: number, scenes: Record<SceneKey, SceneRange>): SceneKey {
  let active: SceneKey = SCENE_ORDER[0]!;
  for (const key of SCENE_ORDER) {
    if (frame >= scenes[key].startFrame) active = key;
  }
  return active;
}

/** Índice do arquivo que corresponde a um frame do vídeo, dado o passo do conjunto. */
export function fileIndexForFrame(frame: number, frameStep: number): number {
  if (frameStep <= 1) return frame;
  return Math.floor(frame / frameStep);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm test tests/frame-math.test.ts && pnpm typecheck`
Expected: PASS em todos.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cinematic/frame-math.ts tests/frame-math.test.ts
git commit -m "Matematica de frame com cobertura das bordas"
```

---

### Task 4: Geometria do cover

**Files:**
- Create: `src/lib/cinematic/draw-cover.ts`
- Create: `tests/draw-cover.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `interface CoverRect { dx: number; dy: number; dw: number; dh: number }`
  - `drawCoverDimensions(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): CoverRect`
  - `drawCoverImage(ctx: CanvasRenderingContext2D, image: CanvasImageSource, sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): void`

- [ ] **Step 1: Escrever os testes**

`tests/draw-cover.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { drawCoverDimensions } from '@/lib/cinematic/draw-cover';

const ratio = (r: { dw: number; dh: number }) => r.dw / r.dh;

describe('drawCoverDimensions', () => {
  it('preenche exatamente quando a proporção bate', () => {
    const r = drawCoverDimensions(1600, 900, 800, 450);
    expect(r).toEqual({ dx: 0, dy: 0, dw: 800, dh: 450 });
  });

  it('transborda na horizontal quando o alvo é mais alto que a fonte', () => {
    const r = drawCoverDimensions(1600, 900, 400, 800);
    expect(r.dh).toBe(800);
    expect(r.dw).toBeGreaterThan(400);
    expect(r.dx).toBeLessThan(0);
    expect(r.dy).toBe(0);
  });

  it('transborda na vertical quando o alvo é mais largo que a fonte', () => {
    const r = drawCoverDimensions(864, 1080, 1200, 600);
    expect(r.dw).toBe(1200);
    expect(r.dh).toBeGreaterThan(600);
    expect(r.dy).toBeLessThan(0);
    expect(r.dx).toBe(0);
  });

  it('nunca deforma a imagem', () => {
    const source = 1600 / 900;
    for (const [tw, th] of [[320, 900], [2560, 400], [1000, 1000], [1, 4000]] as const) {
      expect(ratio(drawCoverDimensions(1600, 900, tw, th))).toBeCloseTo(source, 6);
    }
  });

  it('centraliza o transbordo nos dois eixos', () => {
    const r = drawCoverDimensions(1600, 900, 400, 800);
    expect(r.dx).toBeCloseTo((400 - r.dw) / 2, 6);
    expect(r.dy).toBeCloseTo((800 - r.dh) / 2, 6);
  });

  it('cobre o alvo inteiro, sem sobra', () => {
    const r = drawCoverDimensions(1600, 900, 400, 800);
    expect(r.dx).toBeLessThanOrEqual(0);
    expect(r.dy).toBeLessThanOrEqual(0);
    expect(r.dx + r.dw).toBeGreaterThanOrEqual(400);
    expect(r.dy + r.dh).toBeGreaterThanOrEqual(800);
  });

  it('devolve um retângulo vazio quando a fonte é degenerada', () => {
    expect(drawCoverDimensions(0, 900, 800, 450)).toEqual({ dx: 0, dy: 0, dw: 0, dh: 0 });
    expect(drawCoverDimensions(1600, 0, 800, 450)).toEqual({ dx: 0, dy: 0, dw: 0, dh: 0 });
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test tests/draw-cover.test.ts`
Expected: FAIL, módulo inexistente.

- [ ] **Step 3: Implementar**

`src/lib/cinematic/draw-cover.ts`:

```ts
export interface CoverRect {
  readonly dx: number;
  readonly dy: number;
  readonly dw: number;
  readonly dh: number;
}

const EMPTY: CoverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };

/**
 * Retângulo de destino que cobre o alvo inteiro preservando a proporção da
 * fonte, centralizado. Equivalente a `object-fit: cover`.
 */
export function drawCoverDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): CoverRect {
  if (sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
    return EMPTY;
  }

  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const dw = sourceWidth * scale;
  const dh = sourceHeight * scale;

  return {
    dx: (targetWidth - dw) / 2,
    dy: (targetHeight - dh) / 2,
    dw,
    dh,
  };
}

/** Desenha uma imagem cobrindo o canvas inteiro, sem deformar. */
export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): void {
  const { dx, dy, dw, dh } = drawCoverDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight);
  if (dw <= 0 || dh <= 0) return;
  ctx.drawImage(image, dx, dy, dw, dh);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm test tests/draw-cover.test.ts && pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cinematic/draw-cover.ts tests/draw-cover.test.ts
git commit -m "Geometria de cover preservando aspect ratio"
```

---

### Task 5: Política de carregamento e despejo

**Files:**
- Create: `src/lib/cinematic/load-policy.ts`
- Create: `tests/load-policy.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `interface PriorityOptions { frameCount: number; finalFrame: number; headCount: number; lookAround: number }`
  - `buildLoadPriority(currentFrame: number, loaded: ReadonlySet<number>, options: PriorityOptions): number[]`
  - `nearestLoadedFrame(target: number, loaded: ReadonlyArray<number>): number | null`
  - `framesToEvict(playhead: number, decoded: ReadonlyArray<number>, maxDecoded: number): number[]`

- [ ] **Step 1: Escrever os testes**

`tests/load-policy.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildLoadPriority, nearestLoadedFrame, framesToEvict } from '@/lib/cinematic/load-policy';

const OPTS = { frameCount: 240, finalFrame: 239, headCount: 30, lookAround: 24 };

describe('buildLoadPriority', () => {
  it('pede o primeiro frame antes de tudo', () => {
    expect(buildLoadPriority(0, new Set(), OPTS)[0]).toBe(0);
  });

  it('pede o frame final logo depois do primeiro', () => {
    expect(buildLoadPriority(0, new Set(), OPTS)[1]).toBe(239);
  });

  it('cobre todos os frames exatamente uma vez', () => {
    const order = buildLoadPriority(120, new Set(), OPTS);
    expect(order).toHaveLength(240);
    expect(new Set(order).size).toBe(240);
  });

  it('não repete índice quando o playhead cai dentro da cabeça', () => {
    const order = buildLoadPriority(10, new Set(), OPTS);
    expect(new Set(order).size).toBe(order.length);
  });

  it('omite o que já está carregado', () => {
    const loaded = new Set([0, 239, 120]);
    const order = buildLoadPriority(120, loaded, OPTS);
    expect(order).toHaveLength(237);
    for (const f of loaded) expect(order).not.toContain(f);
  });

  it('põe a vizinhança do playhead antes do resto da sequência', () => {
    const loaded = new Set<number>([0, 239]);
    const order = buildLoadPriority(200, loaded, OPTS);
    const near = order.indexOf(201);
    const far = order.indexOf(150);
    expect(near).toBeGreaterThanOrEqual(0);
    expect(near).toBeLessThan(far);
  });

  it('devolve lista vazia quando tudo já está carregado', () => {
    const loaded = new Set(Array.from({ length: 240 }, (_, i) => i));
    expect(buildLoadPriority(0, loaded, OPTS)).toEqual([]);
  });
});

describe('nearestLoadedFrame', () => {
  it('devolve o próprio alvo quando ele está carregado', () => {
    expect(nearestLoadedFrame(50, [10, 50, 90])).toBe(50);
  });
  it('acha o mais próximo abaixo', () => {
    expect(nearestLoadedFrame(88, [10, 50, 90])).toBe(90);
  });
  it('acha o mais próximo acima', () => {
    expect(nearestLoadedFrame(12, [10, 50, 90])).toBe(10);
  });
  it('resolve empate pelo menor índice', () => {
    expect(nearestLoadedFrame(30, [20, 40])).toBe(20);
  });
  it('devolve null quando não há nada carregado', () => {
    expect(nearestLoadedFrame(30, [])).toBeNull();
  });
});

describe('framesToEvict', () => {
  it('não despeja nada abaixo do teto', () => {
    expect(framesToEvict(50, [48, 49, 50, 51], 10)).toEqual([]);
  });

  it('despeja o mais distante do playhead primeiro', () => {
    const evicted = framesToEvict(50, [0, 49, 50, 51, 239], 3);
    expect(evicted).toEqual([239, 0]);
  });

  it('nunca despeja o frame sob o playhead', () => {
    const evicted = framesToEvict(50, [0, 50, 239], 1);
    expect(evicted).not.toContain(50);
    expect(evicted).toHaveLength(2);
  });

  it('respeita o teto exatamente', () => {
    const decoded = Array.from({ length: 100 }, (_, i) => i);
    const evicted = framesToEvict(50, decoded, 40);
    expect(decoded.length - evicted.length).toBe(40);
  });

  it('aceita lista vazia', () => {
    expect(framesToEvict(50, [], 10)).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test tests/load-policy.test.ts`
Expected: FAIL, módulo inexistente.

- [ ] **Step 3: Implementar**

`src/lib/cinematic/load-policy.ts`:

```ts
export interface PriorityOptions {
  readonly frameCount: number;
  readonly finalFrame: number;
  /** Quantos frames iniciais entram logo depois dos dois âncora. */
  readonly headCount: number;
  /** Raio da janela ao redor do playhead. */
  readonly lookAround: number;
}

/**
 * Ordem em que os frames devem ser buscados, do mais urgente ao menos.
 * Primeiro frame, frame final, cabeça da sequência, vizinhança do playhead,
 * e o restante em ordem. O que já está carregado sai da lista.
 */
export function buildLoadPriority(
  currentFrame: number,
  loaded: ReadonlySet<number>,
  options: PriorityOptions,
): number[] {
  const { frameCount, finalFrame, headCount, lookAround } = options;
  const order: number[] = [];
  const queued = new Set<number>();

  const push = (frame: number): void => {
    if (frame < 0 || frame >= frameCount) return;
    if (queued.has(frame) || loaded.has(frame)) return;
    queued.add(frame);
    order.push(frame);
  };

  push(0);
  push(finalFrame);

  for (let i = 1; i <= headCount; i += 1) push(i);

  // Vizinhança do playhead, alternando para a frente e para trás, porque o
  // scroll pode inverter de direção a qualquer momento.
  push(currentFrame);
  for (let offset = 1; offset <= lookAround; offset += 1) {
    push(currentFrame + offset);
    push(currentFrame - offset);
  }

  for (let i = 0; i < frameCount; i += 1) push(i);

  return order;
}

/** Frame carregado mais próximo do alvo. Empate vai para o menor índice. */
export function nearestLoadedFrame(target: number, loaded: ReadonlyArray<number>): number | null {
  let best: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const frame of loaded) {
    const distance = Math.abs(frame - target);
    if (distance < bestDistance || (distance === bestDistance && best !== null && frame < best)) {
      best = frame;
      bestDistance = distance;
    }
  }

  return best;
}

/**
 * Quais bitmaps decodificados devem ser fechados para o cache voltar ao teto.
 * Despeja do mais distante do playhead para o mais próximo, e nunca despeja o
 * frame que está em tela.
 */
export function framesToEvict(
  playhead: number,
  decoded: ReadonlyArray<number>,
  maxDecoded: number,
): number[] {
  const excess = decoded.length - maxDecoded;
  if (excess <= 0) return [];

  const candidates = decoded
    .filter((frame) => frame !== playhead)
    .sort((a, b) => Math.abs(b - playhead) - Math.abs(a - playhead));

  return candidates.slice(0, excess);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm test && pnpm typecheck`
Expected: PASS em todos os arquivos de teste.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cinematic/load-policy.ts tests/load-policy.test.ts
git commit -m "Politica de prioridade de carga e despejo do cache"
```

---

### Task 6: Pipeline de extração de frames

**Files:**
- Create: `scripts/build-frames.mjs`
- Generates: `public/cinematic/desktop/frame-0000.webp` a `frame-0239.webp`, `public/cinematic/mobile/frame-0000.webp` a `frame-0119.webp`, `public/cinematic/final-city.webp`, `public/cinematic/poster.webp`, `public/cinematic/manifest.json`

**Interfaces:**
- Consumes: `CINEMATIC` da Task 2 (lido por `import`, o script é ESM).
- Produces: `manifest.json` com esta forma exata, consumida pela Task 8:

```json
{
  "generatedAt": "2026-08-19T20:00:00.000Z",
  "source": { "path": "context/video/rafa3.mp4", "width": 1920, "height": 1080, "fps": 24, "frameCount": 240 },
  "sets": {
    "desktop": { "dir": "/cinematic/desktop", "width": 1600, "height": 900, "frameCount": 240, "frameStep": 1, "quality": 74, "totalBytes": 16850000 },
    "mobile":  { "dir": "/cinematic/mobile",  "width": 864,  "height": 1080, "frameCount": 120, "frameStep": 2, "quality": 72, "totalBytes": 6170000 }
  },
  "finalCity": { "path": "/cinematic/final-city.webp", "frame": 239, "width": 1920, "height": 1080 },
  "poster": { "path": "/cinematic/poster.webp", "frame": 0, "width": 1600, "height": 900 }
}
```

- [ ] **Step 1: Escrever o script**

`scripts/build-frames.mjs`:

```js
#!/usr/bin/env node
import { mkdir, rm, readdir, writeFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const run = promisify(execFile);

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'context/video/rafa3.mp4');
const TEMP = path.join(ROOT, '.frames-tmp');
const OUT = path.join(ROOT, 'public/cinematic');

// Espelha src/lib/cinematic/cinematic.config.ts. O script valida contra o
// vídeo real e falha alto se algo divergir, então a duplicação não silencia.
const EXPECTED = { width: 1920, height: 1080, fps: 24, frameCount: 240 };
const FINAL_FRAME = 239;
const DESKTOP_BUDGET_BYTES = 18 * 1024 * 1024;

const SETS = {
  desktop: { dir: 'desktop', width: 1600, height: 900, frameStep: 1, quality: 74, crop: null },
  mobile: {
    dir: 'mobile',
    width: 864,
    height: 1080,
    frameStep: 2,
    quality: 72,
    // Corte central 4:5 do quadro 16:9. Sem redimensionar depois, então não
    // há upscale em lugar nenhum.
    crop: { left: 528, top: 0, width: 864, height: 1080 },
  },
};

async function probe() {
  const { stdout } = await run(ffprobeStatic.path, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,nb_frames',
    '-of', 'json',
    SOURCE,
  ]);
  const stream = JSON.parse(stdout).streams?.[0];
  if (!stream) throw new Error(`ffprobe não achou stream de vídeo em ${SOURCE}`);

  const [num, den] = String(stream.r_frame_rate).split('/').map(Number);
  const actual = {
    width: Number(stream.width),
    height: Number(stream.height),
    fps: num / den,
    frameCount: Number(stream.nb_frames),
  };

  for (const key of Object.keys(EXPECTED)) {
    if (actual[key] !== EXPECTED[key]) {
      throw new Error(
        `Vídeo divergiu da configuração: ${key} esperado ${EXPECTED[key]}, encontrado ${actual[key]}. ` +
          'Atualize EXPECTED aqui e CINEMATIC em src/lib/cinematic/cinematic.config.ts juntos.',
      );
    }
  }
  return actual;
}

async function extractPngs() {
  await rm(TEMP, { recursive: true, force: true });
  await mkdir(TEMP, { recursive: true });
  await run(ffmpegPath, [
    '-y', '-v', 'error',
    '-i', SOURCE,
    '-an',                       // nenhum áudio sai daqui, nunca
    '-vsync', '0',               // um arquivo por frame, sem duplicar nem dropar
    path.join(TEMP, 'src-%04d.png'),
  ]);

  const files = (await readdir(TEMP)).filter((f) => f.endsWith('.png')).sort();
  if (files.length !== EXPECTED.frameCount) {
    throw new Error(`ffmpeg extraiu ${files.length} frames, esperava ${EXPECTED.frameCount}`);
  }
  return files.map((f) => path.join(TEMP, f));
}

async function buildSet(name, config, pngs, quality) {
  const dir = path.join(OUT, config.dir);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  let totalBytes = 0;
  let written = 0;

  for (let frame = 0; frame < pngs.length; frame += config.frameStep) {
    let pipeline = sharp(pngs[frame]);
    if (config.crop) {
      pipeline = pipeline.extract(config.crop);
    } else {
      pipeline = pipeline.resize(config.width, config.height, { kernel: 'lanczos3' });
    }

    const target = path.join(dir, `frame-${String(written).padStart(4, '0')}.webp`);
    await pipeline.webp({ quality, effort: 6 }).toFile(target);
    totalBytes += (await stat(target)).size;
    written += 1;
  }

  return { name, dir: `/cinematic/${config.dir}`, width: config.width, height: config.height,
           frameCount: written, frameStep: config.frameStep, quality, totalBytes };
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

async function main() {
  const source = await probe();
  console.log(`fonte ok: ${source.width}x${source.height} ${source.fps}fps ${source.frameCount} frames`);

  const pngs = await extractPngs();
  console.log(`extraídos ${pngs.length} PNGs`);

  // Desktop com teto de peso: se estourar, a qualidade cai em passos de 4.
  let quality = SETS.desktop.quality;
  let desktop = await buildSet('desktop', SETS.desktop, pngs, quality);
  while (desktop.totalBytes > DESKTOP_BUDGET_BYTES && quality > 50) {
    quality -= 4;
    console.log(`desktop em ${mb(desktop.totalBytes)} MB passou do teto, recodificando em q${quality}`);
    desktop = await buildSet('desktop', SETS.desktop, pngs, quality);
  }
  console.log(`desktop: ${desktop.frameCount} frames, q${desktop.quality}, ${mb(desktop.totalBytes)} MB`);

  const mobile = await buildSet('mobile', SETS.mobile, pngs, SETS.mobile.quality);
  console.log(`mobile: ${mobile.frameCount} frames, q${mobile.quality}, ${mb(mobile.totalBytes)} MB`);

  // O frame final vira o fundo fixo do site inteiro. É o mais olhado da
  // sequência, então sai em resolução cheia e qualidade alta.
  await sharp(pngs[FINAL_FRAME]).webp({ quality: 88, effort: 6 }).toFile(path.join(OUT, 'final-city.webp'));
  await sharp(pngs[0])
    .resize(SETS.desktop.width, SETS.desktop.height, { kernel: 'lanczos3' })
    .webp({ quality: 70, effort: 6 })
    .toFile(path.join(OUT, 'poster.webp'));

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: { path: 'context/video/rafa3.mp4', ...source },
    sets: {
      desktop: { dir: desktop.dir, width: desktop.width, height: desktop.height,
                 frameCount: desktop.frameCount, frameStep: desktop.frameStep,
                 quality: desktop.quality, totalBytes: desktop.totalBytes },
      mobile: { dir: mobile.dir, width: mobile.width, height: mobile.height,
                frameCount: mobile.frameCount, frameStep: mobile.frameStep,
                quality: mobile.quality, totalBytes: mobile.totalBytes },
    },
    finalCity: { path: '/cinematic/final-city.webp', frame: FINAL_FRAME,
                 width: source.width, height: source.height },
    poster: { path: '/cinematic/poster.webp', frame: 0,
              width: SETS.desktop.width, height: SETS.desktop.height },
  };

  await writeFile(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await rm(TEMP, { recursive: true, force: true });
  console.log('manifest.json gravado');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
```

- [ ] **Step 2: Rodar o pipeline**

```bash
pnpm frames
```

Esperado, com os números podendo variar em fração de MB:

```
fonte ok: 1920x1080 24fps 240 frames
extraídos 240 PNGs
desktop: 240 frames, q74, 16.1 MB
mobile: 120 frames, q72, 5.9 MB
manifest.json gravado
```

Se `desktop` sair acima de 18 MB o script recodifica sozinho e imprime a queda de qualidade. Isso é comportamento correto, não erro.

- [ ] **Step 3: Conferir a saída**

```bash
ls public/cinematic/desktop | wc -l   # 240
ls public/cinematic/mobile | wc -l    # 120
cat public/cinematic/manifest.json | head -20
du -sh public/cinematic
```

- [ ] **Step 4: Verificar que a validação morde**

Editar temporariamente `EXPECTED.frameCount` para `241` em `scripts/build-frames.mjs` e rodar `pnpm frames`.
Expected: falha com `Vídeo divergiu da configuração: frameCount esperado 241, encontrado 240` e código de saída 1. Reverter a edição.

- [ ] **Step 5: Commit**

O `.gitignore` já exclui `public/cinematic/desktop/` e `mobile/`. O manifest e os dois frames avulsos entram no histórico.

```bash
git add scripts/build-frames.mjs public/cinematic/manifest.json public/cinematic/final-city.webp public/cinematic/poster.webp
git commit -m "Pipeline de extracao de frames com teto de peso e validacao da fonte"
```

---

### Task 7: Detecção de ambiente

**Files:**
- Create: `src/lib/env/device.ts`
- Create: `tests/device.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type CinematicMode = 'full' | 'reduced' | 'static'`
  - `type FrameSetName = 'desktop' | 'mobile'`
  - `interface EnvironmentSignals { viewportWidth: number; prefersReducedMotion: boolean; saveData: boolean; effectiveType: string | null; deviceMemoryGb: number | null }`
  - `resolveCinematicMode(signals: EnvironmentSignals): CinematicMode`
  - `resolveFrameSet(signals: EnvironmentSignals): FrameSetName`
  - `readEnvironmentSignals(): EnvironmentSignals` (só roda no browser; lança se `window` não existir)
  - `MOBILE_BREAKPOINT_PX = 768`

- [ ] **Step 1: Escrever os testes**

`tests/device.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  resolveCinematicMode,
  resolveFrameSet,
  MOBILE_BREAKPOINT_PX,
  type EnvironmentSignals,
} from '@/lib/env/device';

const base: EnvironmentSignals = {
  viewportWidth: 1440,
  prefersReducedMotion: false,
  saveData: false,
  effectiveType: '4g',
  deviceMemoryGb: 8,
};

describe('resolveCinematicMode', () => {
  it('entrega a experiência completa num desktop comum', () => {
    expect(resolveCinematicMode(base)).toBe('full');
  });

  it('cai para reduced quando o usuário pede menos movimento', () => {
    expect(resolveCinematicMode({ ...base, prefersReducedMotion: true })).toBe('reduced');
  });

  it('cai para static com economia de dados ligada', () => {
    expect(resolveCinematicMode({ ...base, saveData: true })).toBe('static');
  });

  it('cai para static em conexão lenta', () => {
    expect(resolveCinematicMode({ ...base, effectiveType: '2g' })).toBe('static');
    expect(resolveCinematicMode({ ...base, effectiveType: 'slow-2g' })).toBe('static');
    expect(resolveCinematicMode({ ...base, effectiveType: '3g' })).toBe('static');
  });

  it('cai para static em aparelho com pouca memória', () => {
    expect(resolveCinematicMode({ ...base, deviceMemoryGb: 1 })).toBe('static');
  });

  it('prioriza reduced sobre static, porque é escolha do usuário', () => {
    expect(resolveCinematicMode({ ...base, prefersReducedMotion: true, saveData: true })).toBe('reduced');
  });

  it('segue em full quando os sinais opcionais não existem', () => {
    expect(resolveCinematicMode({ ...base, effectiveType: null, deviceMemoryGb: null })).toBe('full');
  });
});

describe('resolveFrameSet', () => {
  it('usa o conjunto mobile abaixo do breakpoint', () => {
    expect(resolveFrameSet({ ...base, viewportWidth: MOBILE_BREAKPOINT_PX - 1 })).toBe('mobile');
    expect(resolveFrameSet({ ...base, viewportWidth: 390 })).toBe('mobile');
  });
  it('usa o conjunto desktop a partir do breakpoint', () => {
    expect(resolveFrameSet({ ...base, viewportWidth: MOBILE_BREAKPOINT_PX })).toBe('desktop');
    expect(resolveFrameSet({ ...base, viewportWidth: 2560 })).toBe('desktop');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test tests/device.test.ts`
Expected: FAIL, módulo inexistente.

- [ ] **Step 3: Implementar**

`src/lib/env/device.ts`:

```ts
export { MOBILE_BREAKPOINT_PX } from '@/lib/cinematic/cinematic.config';
import { MOBILE_BREAKPOINT_PX } from '@/lib/cinematic/cinematic.config';

/** `full` roda o scrub inteiro. `reduced` respeita prefers-reduced-motion. `static` nem baixa a sequência. */
export type CinematicMode = 'full' | 'reduced' | 'static';
export type FrameSetName = 'desktop' | 'mobile';

export interface EnvironmentSignals {
  readonly viewportWidth: number;
  readonly prefersReducedMotion: boolean;
  readonly saveData: boolean;
  /** Da Network Information API. `null` onde o browser não expõe. */
  readonly effectiveType: string | null;
  /** Da Device Memory API, em GB. `null` onde o browser não expõe. */
  readonly deviceMemoryGb: number | null;
}

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);
const MIN_DEVICE_MEMORY_GB = 2;

/**
 * `reduced` vem antes de `static`: economia de dados é uma condição da rede, e
 * preferência de movimento é uma decisão da pessoa. A decisão ganha.
 */
export function resolveCinematicMode(signals: EnvironmentSignals): CinematicMode {
  if (signals.prefersReducedMotion) return 'reduced';
  if (signals.saveData) return 'static';
  if (signals.effectiveType !== null && SLOW_CONNECTIONS.has(signals.effectiveType)) return 'static';
  if (signals.deviceMemoryGb !== null && signals.deviceMemoryGb < MIN_DEVICE_MEMORY_GB) return 'static';
  return 'full';
}

/**
 * Estritamente menor que o breakpoint, porque o `max-md` do Tailwind corta em
 * 767.98px. Usar `<=` faria a largura exata de 768 pedir frames mobile com o
 * fundo em CSS de desktop, e a costura do handoff apareceria nesse pixel.
 */
export function resolveFrameSet(signals: EnvironmentSignals): FrameSetName {
  return signals.viewportWidth < MOBILE_BREAKPOINT_PX ? 'mobile' : 'desktop';
}

interface NetworkInformationLike {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

/** Só chamar em Client Component, depois da montagem. */
export function readEnvironmentSignals(): EnvironmentSignals {
  if (typeof window === 'undefined') {
    throw new Error('readEnvironmentSignals precisa do browser');
  }

  const nav = navigator as Navigator & {
    connection?: NetworkInformationLike;
    deviceMemory?: number;
  };

  return {
    viewportWidth: window.innerWidth,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: nav.connection?.saveData === true,
    effectiveType: nav.connection?.effectiveType ?? null,
    deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
  };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm test && pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/env/device.ts tests/device.test.ts
git commit -m "Deteccao de ambiente para modo do cinematic e conjunto de frames"
```

---

### Task 8: Cache de frames em dois níveis

**Files:**
- Create: `src/lib/cinematic/frame-cache.ts`
- Create: `src/lib/cinematic/use-frame-sequence.ts`

**Interfaces:**
- Consumes: `buildLoadPriority`, `nearestLoadedFrame`, `framesToEvict` (Task 5), `fileIndexForFrame` (Task 3), `CINEMATIC` (Task 2), `FrameSetName` (Task 7).
- Produces:
  - `interface FrameCacheOptions { dir: string; frameCount: number; frameStep: number; maxDecoded: number; concurrency: number; lookAround: number; finalFrame: number }`
  - `class FrameCache` com `get(frame): ImageBitmap | null`, `getNearest(frame): ImageBitmap | null`, `setPlayhead(frame): void`, `start(): void`, `dispose(): void`, `readonly stats: { decoded: number; encoded: number; bytes: number }`, `onFirstFrame(cb: () => void): void`
  - `useFrameSequence(setName: FrameSetName, enabled: boolean): { cache: FrameCache | null; ready: boolean }`

Sem teste unitário aqui: a classe depende de `fetch`, `createImageBitmap` e `ImageBitmap.close`, que exigiriam um mock mais complexo do que o código testado. A lógica que dá para testar sozinha já está coberta na Task 5. A verificação desta task é o comportamento em tela, na Task 9.

- [ ] **Step 1: Escrever o cache**

`src/lib/cinematic/frame-cache.ts`:

```ts
import { buildLoadPriority, framesToEvict, nearestLoadedFrame } from './load-policy';
import { fileIndexForFrame } from './frame-math';

export interface FrameCacheOptions {
  readonly dir: string;
  readonly frameCount: number;
  readonly frameStep: number;
  readonly maxDecoded: number;
  readonly concurrency: number;
  readonly lookAround: number;
  readonly finalFrame: number;
}

const HEAD_COUNT = 30;

/**
 * Guarda a sequência em dois níveis. O nível encoded segura o Blob de todo
 * frame já baixado, cerca de 70 KB cada. O nível decoded segura ImageBitmap
 * prontos numa janela ao redor do playhead, cerca de 5,8 MB cada, e fecha o
 * que sai da janela. Sem essa separação, 240 bitmaps residentes passariam de
 * 1 GB.
 */
export class FrameCache {
  private readonly encoded = new Map<number, Blob>();
  private readonly decoded = new Map<number, ImageBitmap>();
  private readonly inFlight = new Set<number>();
  private readonly firstFrameCallbacks: Array<() => void> = [];

  private playhead = 0;
  private encodedBytes = 0;
  private running = false;
  private disposed = false;
  private firstFrameDelivered = false;
  private pumpScheduled = false;

  constructor(private readonly options: FrameCacheOptions) {}

  get stats(): { decoded: number; encoded: number; bytes: number } {
    return { decoded: this.decoded.size, encoded: this.encoded.size, bytes: this.encodedBytes };
  }

  onFirstFrame(callback: () => void): void {
    if (this.firstFrameDelivered) {
      callback();
      return;
    }
    this.firstFrameCallbacks.push(callback);
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.pump();
  }

  setPlayhead(frame: number): void {
    if (this.playhead === frame) return;
    this.playhead = frame;
    this.evict();
    this.schedulePump();
  }

  /** Bitmap exato do frame, ou null se ele ainda não está decodificado. */
  get(frame: number): ImageBitmap | null {
    return this.decoded.get(frame) ?? null;
  }

  /** Bitmap do frame, ou o mais próximo disponível. Evita canvas vazio. */
  getNearest(frame: number): ImageBitmap | null {
    const exact = this.decoded.get(frame);
    if (exact) return exact;

    const nearest = nearestLoadedFrame(frame, [...this.decoded.keys()]);
    return nearest === null ? null : (this.decoded.get(nearest) ?? null);
  }

  dispose(): void {
    this.disposed = true;
    this.running = false;
    for (const bitmap of this.decoded.values()) bitmap.close();
    this.decoded.clear();
    this.encoded.clear();
    this.inFlight.clear();
    this.encodedBytes = 0;
    this.firstFrameCallbacks.length = 0;
  }

  private urlFor(frame: number): string {
    const index = fileIndexForFrame(frame, this.options.frameStep);
    return `${this.options.dir}/frame-${String(index).padStart(4, '0')}.webp`;
  }

  private schedulePump(): void {
    if (this.pumpScheduled || !this.running || this.disposed) return;
    this.pumpScheduled = true;
    queueMicrotask(() => {
      this.pumpScheduled = false;
      this.pump();
    });
  }

  private pump(): void {
    if (!this.running || this.disposed) return;

    const slots = this.options.concurrency - this.inFlight.size;
    if (slots <= 0) return;

    const known = new Set([...this.encoded.keys(), ...this.inFlight]);
    const queue = buildLoadPriority(this.playhead, known, {
      frameCount: this.options.frameCount,
      finalFrame: this.options.finalFrame,
      headCount: HEAD_COUNT,
      lookAround: this.options.lookAround,
    });

    for (const frame of queue.slice(0, slots)) {
      void this.load(frame);
    }
  }

  private async load(frame: number): Promise<void> {
    if (this.inFlight.has(frame) || this.encoded.has(frame) || this.disposed) return;
    this.inFlight.add(frame);

    try {
      const response = await fetch(this.urlFor(frame));
      if (!response.ok) throw new Error(`frame ${frame}: HTTP ${response.status}`);

      const blob = await response.blob();
      if (this.disposed) return;

      this.encoded.set(frame, blob);
      this.encodedBytes += blob.size;

      await this.decode(frame, blob);
    } catch {
      // Um frame que falhou não trava a sequência: getNearest cobre o buraco.
      // Ele volta para a fila na próxima passada do pump.
    } finally {
      this.inFlight.delete(frame);
      if (!this.disposed) this.schedulePump();
    }
  }

  private async decode(frame: number, blob: Blob): Promise<void> {
    if (this.decoded.has(frame) || this.disposed) return;

    const bitmap = await createImageBitmap(blob);
    if (this.disposed) {
      bitmap.close();
      return;
    }

    this.decoded.set(frame, bitmap);
    this.evict();

    if (!this.firstFrameDelivered) {
      this.firstFrameDelivered = true;
      for (const callback of this.firstFrameCallbacks) callback();
      this.firstFrameCallbacks.length = 0;
    }
  }

  private evict(): void {
    const doomed = framesToEvict(this.playhead, [...this.decoded.keys()], this.options.maxDecoded);
    for (const frame of doomed) {
      this.decoded.get(frame)?.close();
      this.decoded.delete(frame);
    }
  }
}
```

- [ ] **Step 2: Escrever o hook**

`src/lib/cinematic/use-frame-sequence.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';
import { CINEMATIC } from './cinematic.config';
import { FrameCache } from './frame-cache';
import type { FrameSetName } from '@/lib/env/device';

/**
 * Monta o cache do conjunto pedido e devolve quando o primeiro bitmap está
 * pronto para desenhar. `ready` muda poucas vezes na vida da página, então
 * pode ser estado React sem entrar no caminho quente do scroll.
 */
export function useFrameSequence(
  setName: FrameSetName,
  enabled: boolean,
): { cache: FrameCache | null; ready: boolean } {
  const [ready, setReady] = useState(false);
  const [cache, setCache] = useState<FrameCache | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const set = CINEMATIC.frameSets[setName];
    const instance = new FrameCache({
      dir: set.dir,
      frameCount: CINEMATIC.frameCount,
      frameStep: set.frameStep,
      maxDecoded: CINEMATIC.cache.maxDecoded[setName],
      concurrency: CINEMATIC.cache.concurrency,
      lookAround: CINEMATIC.cache.lookAround,
      finalFrame: CINEMATIC.finalFrame,
    });

    setCache(instance);
    setReady(false);
    instance.onFirstFrame(() => setReady(true));
    instance.start();

    return () => {
      instance.dispose();
      setCache(null);
      setReady(false);
    };
  }, [setName, enabled]);

  return { cache, ready };
}
```

- [ ] **Step 3: Verificar tipos**

Run: `pnpm typecheck && pnpm test`
Expected: PASS. Nenhum teste novo, os existentes continuam verdes.

- [ ] **Step 4: Commit**

```bash
git add src/lib/cinematic/frame-cache.ts src/lib/cinematic/use-frame-sequence.ts
git commit -m "Cache de frames em dois niveis com despejo de ImageBitmap"
```

---

### Task 9: Canvas e loop de desenho

**Files:**
- Create: `src/components/cinematic/CinematicCanvas.tsx`

**Interfaces:**
- Consumes: `FrameCache` (Task 8), `drawCoverImage` (Task 4).
- Produces:
  - `interface CinematicCanvasHandle { draw(frame: number): void }`
  - `interface CinematicCanvasProps { cache: FrameCache | null; frameRef: React.RefObject<number>; sourceWidth: number; sourceHeight: number; className?: string }`
  - `CinematicCanvas` como componente com `forwardRef<CinematicCanvasHandle, CinematicCanvasProps>`.

- [ ] **Step 1: Escrever o componente**

`src/components/cinematic/CinematicCanvas.tsx`:

```tsx
'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { drawCoverImage } from '@/lib/cinematic/draw-cover';
import type { FrameCache } from '@/lib/cinematic/frame-cache';

const MAX_DEVICE_PIXEL_RATIO = 2;

export interface CinematicCanvasHandle {
  draw(frame: number): void;
}

export interface CinematicCanvasProps {
  readonly cache: FrameCache | null;
  /** Frame alvo, escrito pela timeline e lido pelo rAF. Nunca vira estado. */
  readonly frameRef: React.RefObject<number>;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly className?: string;
}

/**
 * O canvas é decorativo: toda informação existe em HTML semântico ao lado.
 * O desenho roda num rAF próprio que lê refs, então nenhum frame provoca
 * render do React.
 */
export const CinematicCanvas = forwardRef<CinematicCanvasHandle, CinematicCanvasProps>(
  function CinematicCanvas({ cache, frameRef, sourceWidth, sourceHeight, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const lastDrawnRef = useRef<number>(-1);
    const cssSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

    const paint = (frame: number, force: boolean): void => {
      const ctx = contextRef.current;
      const bitmap = cache?.getNearest(frame) ?? null;
      if (!ctx || !bitmap) return;
      if (!force && frame === lastDrawnRef.current) return;

      const { width, height } = cssSizeRef.current;
      ctx.clearRect(0, 0, width, height);
      drawCoverImage(ctx, bitmap, sourceWidth, sourceHeight, width, height);
      lastDrawnRef.current = frame;
    };

    useImperativeHandle(ref, () => ({ draw: (frame: number) => paint(frame, true) }));

    // Dimensiona o backing store pelo devicePixelRatio, com teto em 2. Acima
    // disso o custo de fill rate sobe sem ganho perceptível.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      contextRef.current = ctx;

      const resize = (): void => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);

        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cssSizeRef.current = { width: rect.width, height: rect.height };

        paint(frameRef.current, true);
      };

      resize();

      const observer = new ResizeObserver(resize);
      observer.observe(canvas);

      return () => {
        observer.disconnect();
        contextRef.current = null;
      };
      // paint fecha sobre refs estáveis; recriar o efeito por causa dela
      // desmontaria o observer a cada render sem motivo.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frameRef, sourceWidth, sourceHeight]);

    // Loop de desenho. Uma iteração por quadro do browser, independente de
    // quantas vezes a timeline escreveu no ref nesse intervalo.
    useEffect(() => {
      if (!cache) return;

      let rafId = 0;
      const tick = (): void => {
        const frame = frameRef.current;
        cache.setPlayhead(frame);
        paint(frame, false);
        rafId = window.requestAnimationFrame(tick);
      };

      rafId = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(rafId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cache, frameRef]);

    // Redesenha assim que o primeiro bitmap chega, sem esperar movimento.
    useEffect(() => {
      if (!cache) return;
      cache.onFirstFrame(() => paint(frameRef.current, true));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cache, frameRef]);

    return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
  },
);
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/cinematic/CinematicCanvas.tsx
git commit -m "Canvas com loop de desenho fora do ciclo de render do React"
```

---

### Task 10: Timeline mestre

**Files:**
- Create: `src/lib/cinematic/use-cinematic-timeline.ts`

**Interfaces:**
- Consumes: `CINEMATIC` (Task 2), `frameFromProgress`, `sceneAtFrame` (Task 3).
- Produces:
  - `interface CinematicTick { progress: number; frame: number; scene: SceneKey }`
  - `interface CinematicTimelineOptions { sectionRef: React.RefObject<HTMLElement | null>; frameRef: React.RefObject<number>; onTick: (tick: CinematicTick) => void; enabled: boolean }`
  - `useCinematicTimeline(options: CinematicTimelineOptions): void`

- [ ] **Step 1: Escrever o hook**

`src/lib/cinematic/use-cinematic-timeline.ts`:

```ts
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CINEMATIC, type SceneKey } from './cinematic.config';
import { frameFromProgress, sceneAtFrame } from './frame-math';

gsap.registerPlugin(ScrollTrigger);

export interface CinematicTick {
  readonly progress: number;
  readonly frame: number;
  readonly scene: SceneKey;
}

export interface CinematicTimelineOptions {
  readonly sectionRef: React.RefObject<HTMLElement | null>;
  readonly frameRef: React.RefObject<number>;
  readonly onTick: (tick: CinematicTick) => void;
  readonly enabled: boolean;
}

/**
 * Um único ScrollTrigger governa a experiência inteira. Ele escreve o frame
 * alvo num ref e chama onTick, que é quem move overlays e trilho por escrita
 * direta no DOM. Nada aqui provoca render do React.
 *
 * O pin fica por conta de `position: sticky` no palco, não do ScrollTrigger:
 * assim o GSAP não reescreve o layout do documento e o resize fica trivial.
 */
export function useCinematicTimeline({
  sectionRef,
  frameRef,
  onTick,
  enabled,
}: CinematicTimelineOptions): void {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    const section = sectionRef.current;
    if (!enabled || !section) return;

    const context = gsap.context(() => {
      const playhead = { progress: 0 };

      gsap.to(playhead, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: CINEMATIC.scrub,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const frame = frameFromProgress(playhead.progress, CINEMATIC.frameCount);
          frameRef.current = frame;
          onTickRef.current({
            progress: playhead.progress,
            frame,
            scene: sceneAtFrame(frame, CINEMATIC.scenes),
          });
        },
      });
    }, section);

    // Uma emissão inicial garante que overlays e trilho nasçam no estado certo
    // mesmo se a página abrir no meio da seção, num reload com scroll salvo.
    onTickRef.current({ progress: 0, frame: 0, scene: 'intro' });

    return () => context.revert();
  }, [sectionRef, frameRef, enabled]);
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/cinematic/use-cinematic-timeline.ts
git commit -m "Timeline mestre com um unico ScrollTrigger em scrub"
```

---

### Task 11: Overlays das cenas

**Files:**
- Create: `src/components/cinematic/CinematicOverlay.tsx`
- Create: `src/components/cinematic/SceneRail.tsx`
- Create: `src/components/ui/Eyebrow.tsx`
- Create: `src/components/ui/CtaLink.tsx`

**Interfaces:**
- Consumes: `getOverlayOpacity` (Task 3), `OverlayWindow`, `SCENE_ORDER` (Task 2).
- Produces:
  - `interface SceneHandle { apply(frame: number): void }`
  - `CinematicOverlay` como `forwardRef<SceneHandle, CinematicOverlayProps>` com props `{ window: OverlayWindow; eyebrow: string; headline: readonly string[]; support: string; ctaLabel: string; ctaHref: string; meta: string }`
  - `SceneRail` como `forwardRef<SceneHandle, Record<string, never>>`, sem props
  - `Eyebrow({ children, className })`, `CtaLink({ href, children, className })`

- [ ] **Step 1: Escrever as primitivas**

`src/components/ui/Eyebrow.tsx`:

```tsx
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="h-px w-[30px] bg-[var(--accent)]" />
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
        {children}
      </span>
    </div>
  );
}
```

`src/components/ui/CtaLink.tsx`:

```tsx
export function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http');

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className="inline-flex items-center gap-3 border border-[var(--accent)] bg-[var(--accent-glow)] px-7 py-[15px] text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--paper)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--ink-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {children}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M2 7h10M8 3l4 4-4 4" />
      </svg>
    </a>
  );
}
```

- [ ] **Step 2: Escrever o overlay**

`src/components/cinematic/CinematicOverlay.tsx`:

```tsx
'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { getOverlayOpacity } from '@/lib/cinematic/frame-math';
import type { OverlayWindow } from '@/lib/cinematic/cinematic.config';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { CtaLink } from '@/components/ui/CtaLink';

export interface SceneHandle {
  apply(frame: number): void;
}

export interface CinematicOverlayProps {
  readonly window: OverlayWindow;
  readonly eyebrow: string;
  readonly headline: readonly string[];
  readonly support: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly meta: string;
}

const TRAVEL_PX = 24;
const BLUR_PX = 8;

/**
 * O bloco fica ancorado no mesmo canto nas duas cenas. Durante o scroll o olho
 * fica parado enquanto o mundo muda atrás: mover o bloco entre as cenas
 * quebraria a leitura.
 *
 * A opacidade é escrita direto no DOM pelo tick da timeline. `pointer-events`
 * acompanha a visibilidade para o CTA invisível não roubar clique.
 */
export const CinematicOverlay = forwardRef<SceneHandle, CinematicOverlayProps>(
  function CinematicOverlay({ window: overlayWindow, eyebrow, headline, support, ctaLabel, ctaHref, meta }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
      apply(frame: number) {
        const node = rootRef.current;
        if (!node) return;

        const opacity = getOverlayOpacity(frame, overlayWindow);
        node.style.opacity = String(opacity);
        node.style.transform = `translate3d(0, ${((1 - opacity) * TRAVEL_PX).toFixed(2)}px, 0)`;
        node.style.filter = opacity >= 1 ? 'none' : `blur(${((1 - opacity) * BLUR_PX).toFixed(2)}px)`;
        node.style.pointerEvents = opacity > 0.9 ? 'auto' : 'none';
      },
    }));

    return (
      <div
        ref={rootRef}
        style={{ opacity: 0, pointerEvents: 'none' }}
        className="absolute bottom-[132px] left-[96px] flex max-w-[660px] flex-col gap-[26px] will-change-[opacity,transform] max-md:bottom-16 max-md:left-6 max-md:right-6"
      >
        <Eyebrow>{eyebrow}</Eyebrow>

        <h2 className="font-display text-[64px] font-semibold leading-[1.02] tracking-[-0.026em] text-[var(--paper)] text-pretty max-md:text-[34px]">
          {headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <p className="max-w-[430px] text-[17px] leading-[1.62] text-[var(--paper-dim)] max-md:text-[15px]">
          {support}
        </p>

        <div className="mt-1.5 flex items-center gap-6 max-md:flex-col max-md:items-start max-md:gap-4">
          <CtaLink href={ctaHref}>{ctaLabel}</CtaLink>
          <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--paper-dim)]">{meta}</span>
        </div>
      </div>
    );
  },
);
```

- [ ] **Step 3: Escrever o trilho de cena**

`src/components/cinematic/SceneRail.tsx`:

```tsx
'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { CINEMATIC, SCENE_ORDER } from '@/lib/cinematic/cinematic.config';
import { sceneAtFrame } from '@/lib/cinematic/frame-math';
import type { SceneHandle } from './CinematicOverlay';

/**
 * Único elemento de HUD do cinematic. Uma seção de 500vh sem referência de
 * posição deixa o usuário sem saber quanto falta; o trilho resolve isso.
 */
export const SceneRail = forwardRef<SceneHandle, Record<string, never>>(function SceneRail(_props, ref) {
  const segmentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useImperativeHandle(ref, () => ({
    apply(frame: number) {
      const active = sceneAtFrame(frame, CINEMATIC.scenes);
      const activeIndex = SCENE_ORDER.indexOf(active);

      segmentRefs.current.forEach((node, index) => {
        if (!node) return;
        node.style.background = index === activeIndex ? 'var(--accent)' : 'rgba(245,247,248,0.22)';
      });

      if (labelRef.current) {
        labelRef.current.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(SCENE_ORDER.length).padStart(2, '0')}`;
      }
    },
  }));

  return (
    <div
      aria-hidden="true"
      className="absolute right-[60px] top-1/2 flex -translate-y-1/2 flex-col items-end gap-[18px] max-md:right-5"
    >
      <span ref={labelRef} className="font-mono text-[10px] tracking-[0.24em] text-[var(--paper-dim)]">
        01 / 04
      </span>
      <div className="flex flex-col gap-[9px]">
        {SCENE_ORDER.map((scene, index) => (
          <div
            key={scene}
            ref={(node) => {
              segmentRefs.current[index] = node;
            }}
            className="h-10 w-0.5 transition-colors duration-200 max-md:h-6"
            style={{ background: 'rgba(245,247,248,0.22)' }}
          />
        ))}
      </div>
    </div>
  );
});
```

- [ ] **Step 4: Verificar tipos**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/cinematic/CinematicOverlay.tsx src/components/cinematic/SceneRail.tsx src/components/ui/Eyebrow.tsx src/components/ui/CtaLink.tsx
git commit -m "Overlays das cenas e trilho de posicao, movidos por escrita direta no DOM"
```

---

### Task 12: Fundo persistente e grão

**Files:**
- Create: `src/components/background/PersistentCityBackground.tsx`
- Create: `src/components/background/GrainOverlay.tsx`

**Interfaces:**
- Consumes: `CINEMATIC.assets` (Task 2), `FrameSetName` (Task 7).
- Produces:
  - `PersistentCityBackground()`, sem props
  - `GrainOverlay({ opacity }: { opacity?: number })`
  - `GRAIN_DATA_URI` exportado de `GrainOverlay.tsx`

**Decisão que difere da spec, aplicada aqui:** o handoff é feito apagando o palco do cinematic, não acendendo a cidade. A cidade fica montada em `z-index: 0` com opacidade 1 desde o primeiro paint; o palco cobre ela por cima e some no fim. Como o último frame do canvas e a imagem de fundo são o mesmo frame 239, no mesmo `cover`, no mesmo viewport, não há diferença para o olho. E a imagem já está decodificada muito antes de ser revelada.

Isso exige um `final-city` por conjunto: o desktop desenha frames 16:9 e o mobile desenha frames 4:5, então um fundo 16:9 único quebraria a costura no celular. A Task 6 gera `final-city.webp` (1920x1080) e `final-city-mobile.webp` (864x1080).

- [ ] **Step 1: Escrever o grão**

`src/components/background/GrainOverlay.tsx`:

```tsx
/**
 * Ruído gerado por feTurbulence num data URI: sem requisição, sem arquivo de
 * textura, sem cache para invalidar. Vai por cima do canvas e por cima da
 * cidade com a mesma intensidade, então a textura é contínua através do
 * handoff e ajuda a costurar os dois.
 */
export const GRAIN_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

const DEFAULT_OPACITY = 0.035;

export function GrainOverlay({ opacity = DEFAULT_OPACITY }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{ opacity, backgroundImage: GRAIN_DATA_URI }}
    />
  );
}
```

- [ ] **Step 2: Acrescentar os assets à configuração**

Em `src/lib/cinematic/cinematic.config.ts`, dentro de `assets`:

```ts
  assets: {
    finalCity: '/cinematic/final-city.webp',
    finalCityMobile: '/cinematic/final-city-mobile.webp',
    poster: '/cinematic/poster.webp',
    manifest: '/cinematic/manifest.json',
  },
```

- [ ] **Step 3: Escrever o fundo**

`src/components/background/PersistentCityBackground.tsx`:

```tsx
import { CINEMATIC, MOBILE_BREAKPOINT_PX } from '@/lib/cinematic/cinematic.config';
import { GrainOverlay } from './GrainOverlay';

/**
 * A cidade fica fixa atrás do site inteiro, em z-index 0, opacidade 1 desde o
 * primeiro paint. O palco do cinematic cobre ela e some no fim da sequência.
 *
 * `<picture>` em vez de next/image porque isto é art direction, não
 * responsividade de tamanho: o desktop desenha frames 16:9 e o mobile desenha
 * frames 4:5, então o fundo precisa ser o recorte correspondente ou a costura
 * do handoff aparece. O browser baixa um arquivo só, e a escolha acontece sem
 * JavaScript, no servidor.
 *
 * Nenhuma seção institucional usa fundo opaco: o scrim e os gradientes daqui
 * dão o contraste que o texto precisa sem apagar a cidade.
 */
export function PersistentCityBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden bg-[var(--ink-900)]">
      <picture>
        <source
          media={`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`}
          srcSet={CINEMATIC.assets.finalCityMobile}
        />
        <img
          src={CINEMATIC.assets.finalCity}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      <div className="absolute inset-0 bg-[rgba(5,6,7,0.62)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,7,0.5)_0%,rgba(5,6,7,0.1)_40%,rgba(5,6,7,0.62)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_22%_45%,rgba(5,6,7,0.9)_0%,rgba(5,6,7,0.34)_62%,rgba(5,6,7,0.6)_100%)]" />
      <GrainOverlay />
    </div>
  );
}
```

- [ ] **Step 4: Gerar o final-city do mobile**

Em `scripts/build-frames.mjs`, logo depois da linha que grava `final-city.webp`:

```js
  await sharp(pngs[FINAL_FRAME])
    .extract(SETS.mobile.crop)
    .webp({ quality: 88, effort: 6 })
    .toFile(path.join(OUT, 'final-city-mobile.webp'));
```

E no `manifest`, ao lado de `finalCity`:

```js
    finalCityMobile: { path: '/cinematic/final-city-mobile.webp', frame: FINAL_FRAME,
                       width: SETS.mobile.width, height: SETS.mobile.height },
```

Rodar de novo e conferir:

```bash
pnpm frames && ls -la public/cinematic/final-city*.webp
```

- [ ] **Step 5: Verificar e commitar**

Run: `pnpm typecheck && pnpm test`
Expected: PASS.

```bash
git add src/components/background scripts/build-frames.mjs src/lib/cinematic/cinematic.config.ts public/cinematic/final-city-mobile.webp public/cinematic/manifest.json
git commit -m "Fundo persistente da cidade com grao continuo e final-city por conjunto"
```

---

### Task 13: Painel de debug

**Files:**
- Create: `src/components/cinematic/CinematicDebugPanel.tsx`
- Create: `src/lib/cinematic/use-cinematic-debug.ts`

**Interfaces:**
- Consumes: `CinematicTick` (Task 10), `FrameCache` (Task 8).
- Produces:
  - `useCinematicDebugEnabled(): boolean`
  - `interface DebugSnapshot { progress: number; frame: number; scene: SceneKey; decoded: number; encoded: number; bytes: number; fps: number }`
  - `CinematicDebugPanel({ tickRef, cache }: { tickRef: React.RefObject<CinematicTick>; cache: FrameCache | null })`

- [ ] **Step 1: Escrever o gate**

`src/lib/cinematic/use-cinematic-debug.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

export const DEBUG_QUERY_PARAM = 'cinematicDebug';

/**
 * Desligado por padrão em qualquer ambiente, inclusive produção. Só a query
 * string liga, o que permite calibrar frame a frame num deploy real sem
 * expor o painel para quem chega pela URL limpa.
 */
export function useCinematicDebugEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get(DEBUG_QUERY_PARAM) === 'true');
  }, []);

  return enabled;
}
```

- [ ] **Step 2: Escrever o painel**

`src/components/cinematic/CinematicDebugPanel.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';
import type { CinematicTick } from '@/lib/cinematic/use-cinematic-timeline';
import type { FrameCache } from '@/lib/cinematic/frame-cache';

const SAMPLE_INTERVAL_MS = 200;

interface DebugSnapshot {
  readonly progress: number;
  readonly frame: number;
  readonly scene: string;
  readonly decoded: number;
  readonly encoded: number;
  readonly bytes: number;
  readonly fps: number;
}

/**
 * Lê os refs a 5 Hz em vez de renderizar por frame. O painel existe para
 * calibrar a sequência, e nenhuma calibragem precisa de 60 amostras por
 * segundo.
 */
export function CinematicDebugPanel({
  tickRef,
  cache,
}: {
  tickRef: React.RefObject<CinematicTick>;
  cache: FrameCache | null;
}) {
  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let rafId = 0;

    const count = (): void => {
      frames += 1;
      rafId = window.requestAnimationFrame(count);
    };
    rafId = window.requestAnimationFrame(count);

    const timer = window.setInterval(() => {
      const now = performance.now();
      const fps = (frames * 1000) / (now - last);
      frames = 0;
      last = now;

      const tick = tickRef.current;
      const stats = cache?.stats ?? { decoded: 0, encoded: 0, bytes: 0 };

      setSnapshot({
        progress: tick.progress,
        frame: tick.frame,
        scene: tick.scene,
        decoded: stats.decoded,
        encoded: stats.encoded,
        bytes: stats.bytes,
        fps,
      });
    }, SAMPLE_INTERVAL_MS);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearInterval(timer);
    };
  }, [tickRef, cache]);

  if (!snapshot) return null;

  const rows: ReadonlyArray<readonly [string, string]> = [
    ['Progress', `${(snapshot.progress * 100).toFixed(1)}%`],
    ['Frame', `${snapshot.frame} / ${CINEMATIC.finalFrame}`],
    ['Scene', snapshot.scene],
    ['Decoded', `${snapshot.decoded} / ${CINEMATIC.frameCount}`],
    ['Encoded', `${snapshot.encoded} (${(snapshot.bytes / 1024 / 1024).toFixed(1)} MB)`],
    ['Draw fps', snapshot.fps.toFixed(0)],
  ];

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-50 border border-[var(--surface-border)] bg-[rgba(5,8,12,0.82)] px-4 py-3 font-mono text-[11px] leading-relaxed text-[var(--paper)] backdrop-blur-md">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-3">
          <span className="w-[72px] text-[var(--paper-dim)]">{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/cinematic/CinematicDebugPanel.tsx src/lib/cinematic/use-cinematic-debug.ts
git commit -m "Painel de debug atras de query param, amostrado a 5 Hz"
```

---

### Task 14: Composição do cinematic

**Files:**
- Create: `src/components/cinematic/CinematicExperience.tsx`
- Create: `src/lib/content/site-content.ts`

**Interfaces:**
- Consumes: tudo das Tasks 7 a 13.
- Produces:
  - `SITE_CONTENT` com `nav`, `cta`, `cinematic.sharknews`, `cinematic.aiAgent`, `intro`, `products`, `technology`, `about`, `cases`, `contact`, `footer`
  - `CinematicExperience()` como Client Component sem props

- [ ] **Step 1: Escrever o conteúdo**

`src/lib/content/site-content.ts`:

```ts
export const WHATSAPP_URL = 'https://wa.me/5511912839594';
export const INSTAGRAM_URL = 'https://instagram.com/shkgroup.ia';

/**
 * Toda copy visível do site vive aqui. Nenhuma string hardcodada em
 * componente: a revisão de texto acontece em um arquivo só, e trocar de
 * idioma depois não exige tocar em componente nenhum.
 *
 * Nada aqui afirma número que não dê para sustentar. Casos, clientes,
 * métricas e depoimentos ficam de fora até existir material verificável.
 */
export const SITE_CONTENT = {
  brand: { name: 'SHK GROUP', logoAlt: '' },

  nav: [
    { label: 'Products', href: '#products' },
    { label: 'Technology', href: '#technology' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  cta: { label: 'Activate AI Agent', href: WHATSAPP_URL },

  cinematic: {
    sharknews: {
      eyebrow: 'SharkNews',
      headline: ['What matters in technology,', 'before your day begins.'],
      support: 'Technology, AI and innovation, curated daily at 07:07. Five minutes, free, one click to leave.',
      ctaLabel: 'Get SharkNews',
      ctaHref: WHATSAPP_URL,
      meta: 'DAILY 07:07',
    },
    aiAgent: {
      eyebrow: 'AI Agent',
      headline: ['Conversations that move', 'toward conversion.'],
      support: 'AI that responds, qualifies, automates and advances every opportunity on WhatsApp and Instagram.',
      ctaLabel: 'Explore AI Agent',
      ctaHref: WHATSAPP_URL,
      meta: 'WHATSAPP + INSTAGRAM',
    },
  },

  intro: {
    eyebrow: 'Who we are',
    headline: 'Technology that changes how a business sells.',
    body: 'SHK Group builds AI agents, software and digital products for companies whose sales operation runs slower than their demand. We work as a partner inside the operation, not as a vendor at the edge of it.',
    pillars: [
      { index: '01', label: 'AI & Automation' },
      { index: '02', label: 'Software' },
      { index: '03', label: 'Digital Products' },
    ],
    meta: '48H Activation',
  },

  products: {
    eyebrow: 'Products',
    headline: 'Two products. One operation.',
    support: 'One keeps you ahead of what is happening. The other keeps every channel answering at any hour.',
    items: [
      {
        id: 'sharknews',
        eyebrow: 'SharkNews',
        badge: '07:07',
        headline: 'The technology briefing that arrives before your day.',
        body: 'Curated technology, AI and innovation news. Five minutes of reading, delivered daily.',
        points: ['Free, forever', 'No spam', 'One click to leave'],
        ctaLabel: 'Get SharkNews',
        ctaHref: WHATSAPP_URL,
      },
      {
        id: 'ai-agent',
        eyebrow: 'AI Agent',
        badge: '48H ACTIVATION',
        headline: 'Every channel answers, at any hour.',
        body: 'An agent on WhatsApp and Instagram that responds, qualifies leads and carries the conversation to the close.',
        points: [
          'Reads audio, images and comments',
          'Payment links, Pix and scheduling',
          'Remembers every conversation',
        ],
        ctaLabel: 'Explore AI Agent',
        ctaHref: WHATSAPP_URL,
      },
    ],
  },

  technology: {
    eyebrow: 'Technology',
    headline: 'What the agent actually does.',
    support: 'Capabilities available on WhatsApp Business and Instagram, configured per operation.',
    capabilities: [
      'Responds in seconds, at any hour',
      'Qualifies leads automatically',
      'Carries the conversation through the funnel',
      'Transcribes audio messages',
      'Reads and answers Instagram comments',
      'Moves comment threads into Direct',
      'Generates payment links and Pix codes',
      'Books appointments',
      'Saves contacts into CRM or spreadsheet',
      'Keeps the context of a conversation across sessions',
      'Hands over to a person when the conversation calls for it',
    ],
  },

  about: {
    eyebrow: 'About',
    headline: 'A partner inside the operation.',
    body: 'SHK Group combines artificial intelligence, software development and digital products. The work starts at the channel where the customer already is, and moves outward from there.',
    notes: [
      { title: 'Implementation in days', body: 'An agent goes live within 48 hours of the channel and funnel being defined.' },
      { title: 'One connected stack', body: 'AI, software and marketing built by the same team, so nothing gets lost between vendors.' },
    ],
  },

  cases: {
    eyebrow: 'Cases',
    headline: 'Results, once they can be shown.',
    // Placeholder deliberado. Nenhum caso, cliente ou número entra aqui sem
    // material verificável. Ver seção 16 da spec.
    placeholder: 'This section is reserved for client work with published, verifiable results. Nothing is listed here yet.',
  },

  contact: {
    eyebrow: 'Contact',
    headline: 'Start the conversation on WhatsApp.',
    body: 'Tell us which channel you sell on and what the operation looks like today. We answer on WhatsApp.',
    ctaLabel: 'Talk on WhatsApp',
    ctaHref: WHATSAPP_URL,
    instagramLabel: '@shkgroup.ia',
    instagramHref: INSTAGRAM_URL,
  },

  footer: {
    copyright: `© ${new Date().getFullYear()} SHK GROUP`,
    links: [
      { label: 'Instagram', href: INSTAGRAM_URL },
      { label: 'WhatsApp', href: WHATSAPP_URL },
    ],
  },
} as const;
```

- [ ] **Step 2: Escrever a composição**

`src/components/cinematic/CinematicExperience.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';
import { useFrameSequence } from '@/lib/cinematic/use-frame-sequence';
import { useCinematicTimeline, type CinematicTick } from '@/lib/cinematic/use-cinematic-timeline';
import { useCinematicDebugEnabled } from '@/lib/cinematic/use-cinematic-debug';
import { readEnvironmentSignals, resolveCinematicMode, resolveFrameSet, type CinematicMode, type FrameSetName } from '@/lib/env/device';
import { SITE_CONTENT } from '@/lib/content/site-content';
import { CinematicCanvas } from './CinematicCanvas';
import { CinematicOverlay, type SceneHandle } from './CinematicOverlay';
import { SceneRail } from './SceneRail';
import { CinematicDebugPanel } from './CinematicDebugPanel';
import { GrainOverlay } from '@/components/background/GrainOverlay';

/** Fração final do scroll onde o palco some, revelando a cidade idêntica. */
const HANDOFF_START_PROGRESS = 0.985;

export function CinematicExperience() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const sharkRef = useRef<SceneHandle | null>(null);
  const agentRef = useRef<SceneHandle | null>(null);
  const railRef = useRef<SceneHandle | null>(null);
  const frameRef = useRef<number>(0);
  const tickRef = useRef<CinematicTick>({ progress: 0, frame: 0, scene: 'intro' });

  const [mode, setMode] = useState<CinematicMode | null>(null);
  const [frameSet, setFrameSet] = useState<FrameSetName>('desktop');
  const debugEnabled = useCinematicDebugEnabled();

  // Os sinais são lidos uma vez depois da montagem. Trocar de conjunto no
  // meio do scroll descartaria o cache inteiro por um resize de barra de
  // endereço, então a decisão fica travada até um reload.
  useEffect(() => {
    const signals = readEnvironmentSignals();
    setMode(resolveCinematicMode(signals));
    setFrameSet(resolveFrameSet(signals));
  }, []);

  const active = mode === 'full';
  const { cache, ready } = useFrameSequence(frameSet, active);
  const set = CINEMATIC.frameSets[frameSet];

  useCinematicTimeline({
    sectionRef,
    frameRef,
    enabled: active,
    onTick: (tick) => {
      tickRef.current = tick;
      sharkRef.current?.apply(tick.frame);
      agentRef.current?.apply(tick.frame);
      railRef.current?.apply(tick.frame);

      const stage = stageRef.current;
      if (stage) {
        const t = (tick.progress - HANDOFF_START_PROGRESS) / (1 - HANDOFF_START_PROGRESS);
        stage.style.opacity = String(1 - Math.min(1, Math.max(0, t)));
      }
    },
  });

  const heightVh = frameSet === 'mobile' ? CINEMATIC.scrollHeightVh.mobile : CINEMATIC.scrollHeightVh.desktop;

  // Sem cinematic, o conteúdo das duas cenas continua acessível: os overlays
  // viram blocos estáticos empilhados sobre a cidade.
  if (mode !== null && !active) {
    return <StaticCinematic />;
  }

  return (
    <section
      ref={sectionRef}
      aria-label="SHK Group cinematic introduction"
      className="relative z-10"
      style={{ height: `${heightVh}vh` }}
    >
      <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden">
        {!ready && (
          <Image
            src={CINEMATIC.assets.poster}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        <CinematicCanvas
          cache={cache}
          frameRef={frameRef}
          sourceWidth={set.width}
          sourceHeight={set.height}
          className="absolute inset-0 h-full w-full"
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(5,6,7,0.94)_0%,rgba(5,6,7,0.72)_34%,rgba(5,6,7,0.16)_68%,rgba(5,6,7,0.42)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,6,7,0.86)_0%,rgba(5,6,7,0)_42%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,rgba(5,6,7,0)_38%,rgba(5,6,7,0.72)_100%)]" />
        <GrainOverlay />

        <CinematicOverlay ref={sharkRef} window={CINEMATIC.overlays.sharknews} {...SITE_CONTENT.cinematic.sharknews} />
        <CinematicOverlay ref={agentRef} window={CINEMATIC.overlays.aiAgent} {...SITE_CONTENT.cinematic.aiAgent} />
        <SceneRail ref={railRef} />
      </div>

      {debugEnabled && <CinematicDebugPanel tickRef={tickRef} cache={cache} />}
    </section>
  );
}

/** Caminho de reduced-motion, save-data e conexão lenta. */
function StaticCinematic() {
  const scenes = [SITE_CONTENT.cinematic.sharknews, SITE_CONTENT.cinematic.aiAgent];

  return (
    <section aria-label="SHK Group introduction" className="relative z-10">
      {scenes.map((scene) => (
        <div key={scene.eyebrow} className="flex min-h-screen items-center px-24 max-md:px-6">
          <StaticScene scene={scene} />
        </div>
      ))}
    </section>
  );
}

function StaticScene({ scene }: { scene: (typeof SITE_CONTENT)['cinematic']['sharknews'] }) {
  return (
    <div className="flex max-w-[660px] flex-col gap-[26px]">
      <div className="flex items-center gap-3.5">
        <div className="h-px w-[30px] bg-[var(--accent)]" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
          {scene.eyebrow}
        </span>
      </div>
      <h2 className="font-display text-[56px] font-semibold leading-[1.04] tracking-[-0.026em] text-pretty max-md:text-[32px]">
        {scene.headline.join(' ')}
      </h2>
      <p className="max-w-[460px] text-[17px] leading-[1.62] text-[var(--paper-dim)]">{scene.support}</p>
      <a
        href={scene.ctaHref}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex w-fit items-center gap-3 border border-[var(--accent)] bg-[var(--accent-glow)] px-7 py-[15px] text-[13px] font-medium uppercase tracking-[0.1em]"
      >
        {scene.ctaLabel}
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/cinematic/CinematicExperience.tsx src/lib/content/site-content.ts
git commit -m "Composicao do cinematic com handoff por opacidade do palco"
```

---

### Task 15: Cabeçalho, rodapé e casca de seção

**Files:**
- Create: `src/components/layout/SiteHeader.tsx`
- Create: `src/components/layout/SiteFooter.tsx`
- Create: `src/components/ui/SectionShell.tsx`

**Interfaces:**
- Consumes: `SITE_CONTENT` (Task 14), `Eyebrow`, `CtaLink` (Task 11).
- Produces:
  - `SiteHeader()` e `SiteFooter()`, ambos Server Components
  - `SectionShell({ id, eyebrow, headline, support, children })`

- [ ] **Step 1: Escrever o cabeçalho**

`src/components/layout/SiteHeader.tsx`:

```tsx
import Image from 'next/image';
import { SITE_CONTENT } from '@/lib/content/site-content';
import { CtaLink } from '@/components/ui/CtaLink';

/**
 * Server Component: nenhuma API de browser aqui, então o header já vem no HTML
 * e é indexável sem depender do cinematic ter carregado.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.07] bg-[rgba(5,6,7,0.42)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-24 py-[22px] max-md:px-6 max-md:py-4">
        <a href="#top" className="flex items-center gap-4">
          <Image src="/brand/logo.png" alt="" width={46} height={26} priority className="h-[26px] w-auto" />
          <span className="font-display text-[15px] font-bold tracking-[0.2em]">{SITE_CONTENT.brand.name}</span>
          <span className="sr-only">SHK Group, back to top</span>
        </a>

        <nav aria-label="Main" className="flex items-center gap-10 text-sm max-lg:hidden">
          {SITE_CONTENT.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[var(--paper-dim)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="max-md:hidden">
          <CtaLink href={SITE_CONTENT.cta.href}>{SITE_CONTENT.cta.label}</CtaLink>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Escrever o rodapé**

`src/components/layout/SiteFooter.tsx`:

```tsx
import { SITE_CONTENT } from '@/lib/content/site-content';

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-[rgba(5,6,7,0.72)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-24 py-10 text-sm text-[var(--paper-dim)] max-md:flex-col max-md:items-start max-md:gap-6 max-md:px-6">
        <span>{SITE_CONTENT.footer.copyright}</span>
        <nav aria-label="Footer" className="flex gap-8">
          {SITE_CONTENT.footer.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Escrever a casca de seção**

`src/components/ui/SectionShell.tsx`:

```tsx
import { Eyebrow } from './Eyebrow';

/**
 * Casca comum das seções institucionais. Sem fundo próprio: a cidade fica
 * visível através de todas elas, e o contraste vem dos gradientes do
 * PersistentCityBackground.
 */
export function SectionShell({
  id,
  eyebrow,
  headline,
  support,
  children,
}: {
  id: string;
  eyebrow: string;
  headline: string;
  support?: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="relative z-10 px-24 py-40 max-md:px-6 max-md:py-24">
      <div className="mx-auto max-w-[1248px]">
        <div className="flex items-end justify-between gap-16 max-lg:flex-col max-lg:items-start max-lg:gap-8">
          <div className="flex max-w-[620px] flex-col gap-6">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="font-display text-[52px] font-semibold leading-[1.06] tracking-[-0.024em] text-pretty max-md:text-[32px]">
              {headline}
            </h2>
          </div>
          {support ? (
            <p className="max-w-[360px] text-base leading-[1.62] text-[var(--paper-dim)]">{support}</p>
          ) : null}
        </div>

        {children ? <div className="mt-[68px] max-md:mt-12">{children}</div> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verificar e commitar**

Run: `pnpm typecheck`
Expected: PASS.

```bash
git add src/components/layout src/components/ui/SectionShell.tsx
git commit -m "Cabecalho fixo, rodape e casca comum das secoes"
```

---

### Task 16: Seções institucionais e montagem da página

**Files:**
- Create: `src/components/sections/InstitutionalIntro.tsx`
- Create: `src/components/sections/ProductsSection.tsx`
- Create: `src/components/sections/TechnologySection.tsx`
- Create: `src/components/sections/AboutSection.tsx`
- Create: `src/components/sections/CasesSection.tsx`
- Create: `src/components/sections/ContactSection.tsx`
- Modify: `src/app/page.tsx` (substituir por inteiro)

**Interfaces:**
- Consumes: `SITE_CONTENT` (Task 14), `SectionShell`, `Eyebrow`, `CtaLink`, `CinematicExperience`, `PersistentCityBackground`, `SiteHeader`, `SiteFooter`.
- Produces: `Home()` como Server Component em `src/app/page.tsx`.

- [ ] **Step 1: Escrever a intro**

`src/components/sections/InstitutionalIntro.tsx`:

```tsx
import { SITE_CONTENT } from '@/lib/content/site-content';
import { Eyebrow } from '@/components/ui/Eyebrow';

export function InstitutionalIntro() {
  const { eyebrow, headline, body, pillars, meta } = SITE_CONTENT.intro;

  return (
    <section id="intro" className="relative z-10 px-24 py-40 max-md:px-6 max-md:py-24">
      <div className="mx-auto flex max-w-[1248px] flex-col gap-9">
        <Eyebrow>{eyebrow}</Eyebrow>

        <h2 className="max-w-[700px] font-display text-[58px] font-semibold leading-[1.06] tracking-[-0.024em] text-pretty max-md:text-[34px]">
          {headline}
        </h2>

        <p className="max-w-[520px] text-lg leading-[1.62] text-[var(--paper-dim)]">{body}</p>

        <ul className="mt-3.5 grid grid-cols-3 border-t border-white/[0.09] max-md:grid-cols-1">
          {pillars.map((pillar) => (
            <li key={pillar.index} className="border-r border-white/[0.09] py-7 pr-8 last:border-r-0 max-md:border-r-0 max-md:border-b max-md:pr-0">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                {pillar.index}
              </div>
              <div className="font-display text-[17px] font-medium">{pillar.label}</div>
            </li>
          ))}
        </ul>

        <p className="self-end font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--paper-dim)] max-md:self-start">
          {meta}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Escrever os produtos**

`src/components/sections/ProductsSection.tsx`:

```tsx
import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';
import { CtaLink } from '@/components/ui/CtaLink';

export function ProductsSection() {
  const { eyebrow, headline, support, items } = SITE_CONTENT.products;

  return (
    <SectionShell id="products" eyebrow={eyebrow} headline={headline} support={support}>
      <div className="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-[30px] border border-[var(--surface-border)] bg-[var(--surface)] p-12 backdrop-blur-lg max-md:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">
                {item.eyebrow}
              </span>
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--paper-dim)]">{item.badge}</span>
            </div>

            <h3 className="font-display text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] text-pretty max-md:text-[26px]">
              {item.headline}
            </h3>

            <p className="text-base leading-[1.62] text-[var(--paper-dim)]">{item.body}</p>

            <ul className="flex flex-col gap-3.5 border-t border-white/[0.07] pt-6">
              {item.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[15px] text-[var(--paper-dim)]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--accent)" strokeWidth="1.4" aria-hidden="true">
                    <path d="M2.5 7.5l3 3 6-7" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-2 self-start">
              <CtaLink href={item.ctaHref}>{item.ctaLabel}</CtaLink>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 3: Escrever tecnologia, sobre, casos e contato**

`src/components/sections/TechnologySection.tsx`:

```tsx
import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

export function TechnologySection() {
  const { eyebrow, headline, support, capabilities } = SITE_CONTENT.technology;

  return (
    <SectionShell id="technology" eyebrow={eyebrow} headline={headline} support={support}>
      <ul className="grid grid-cols-3 gap-x-10 gap-y-0 max-lg:grid-cols-2 max-md:grid-cols-1">
        {capabilities.map((capability) => (
          <li
            key={capability}
            className="flex items-start gap-4 border-b border-white/[0.07] py-5 text-[15px] leading-[1.5] text-[var(--paper-dim)]"
          >
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]" />
            {capability}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
```

`src/components/sections/AboutSection.tsx`:

```tsx
import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

export function AboutSection() {
  const { eyebrow, headline, body, notes } = SITE_CONTENT.about;

  return (
    <SectionShell id="about" eyebrow={eyebrow} headline={headline} support={body}>
      <div className="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
        {notes.map((note) => (
          <div key={note.title} className="border-t border-white/[0.09] pt-7">
            <h3 className="mb-3 font-display text-xl font-medium">{note.title}</h3>
            <p className="text-base leading-[1.62] text-[var(--paper-dim)]">{note.body}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
```

`src/components/sections/CasesSection.tsx`:

```tsx
import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Slot deliberadamente vazio. Caso, cliente, métrica e depoimento só entram
 * com material verificável. Ver seção 16 da spec.
 */
export function CasesSection() {
  const { eyebrow, headline, placeholder } = SITE_CONTENT.cases;

  return (
    <SectionShell id="cases" eyebrow={eyebrow} headline={headline}>
      <p className="max-w-[560px] border-l border-[var(--accent-dim)] pl-6 text-base leading-[1.62] text-[var(--paper-dim)]">
        {placeholder}
      </p>
    </SectionShell>
  );
}
```

`src/components/sections/ContactSection.tsx`:

```tsx
import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';
import { CtaLink } from '@/components/ui/CtaLink';

export function ContactSection() {
  const { eyebrow, headline, body, ctaLabel, ctaHref, instagramLabel, instagramHref } = SITE_CONTENT.contact;

  return (
    <SectionShell id="contact" eyebrow={eyebrow} headline={headline} support={body}>
      <div className="flex items-center gap-8 max-md:flex-col max-md:items-start max-md:gap-5">
        <CtaLink href={ctaHref}>{ctaLabel}</CtaLink>
        <a
          href={instagramHref}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[13px] tracking-[0.16em] text-[var(--paper-dim)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          {instagramLabel}
        </a>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 4: Montar a página**

`src/app/page.tsx`:

```tsx
import { PersistentCityBackground } from '@/components/background/PersistentCityBackground';
import { CinematicExperience } from '@/components/cinematic/CinematicExperience';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { InstitutionalIntro } from '@/components/sections/InstitutionalIntro';
import { ProductsSection } from '@/components/sections/ProductsSection';
import { TechnologySection } from '@/components/sections/TechnologySection';
import { AboutSection } from '@/components/sections/AboutSection';
import { CasesSection } from '@/components/sections/CasesSection';
import { ContactSection } from '@/components/sections/ContactSection';

/**
 * Server Component. Só o cinematic é cliente, e ele não segura nada: todo o
 * conteúdo institucional está no HTML da primeira resposta.
 */
export default function Home() {
  return (
    <>
      <PersistentCityBackground />
      <SiteHeader />

      <main id="top">
        <CinematicExperience />
        <InstitutionalIntro />
        <ProductsSection />
        <TechnologySection />
        <AboutSection />
        <CasesSection />
        <ContactSection />
      </main>

      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: PASS nos três.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections src/app/page.tsx
git commit -m "Secoes institucionais sobre a cidade fixa"
```

---

### Task 17: Verificação contra os critérios de aceite

**Files:**
- Modify: qualquer arquivo onde a verificação achar defeito.

**Interfaces:**
- Consumes: tudo.
- Produces: nada de novo. Esta task fecha os critérios da seção 15 da spec.

Nenhum item abaixo pode ser marcado sem o comando ter rodado e a saída ter sido lida. Evidência antes de afirmação.

- [ ] **Step 1: Portões automáticos**

```bash
pnpm typecheck && pnpm test && pnpm build
grep -rn "': any\|as any\|<any>" src/ || echo "nenhum any"
grep -rni "audio\|AudioContext\|\.play()" src/ || echo "nenhum audio"
```
Expected: os três passam, e os dois greps não acham nada.

- [ ] **Step 2: Scroll nos dois sentidos**

```bash
pnpm dev
```

Abrir `http://localhost:3000?cinematicDebug=true` e rolar devagar de cima até o fim, depois de volta ao topo.
Expected: o frame do painel sobe de 0 a 239 e desce de volta, sem travar nem pular. `Draw fps` fica acima de 50 num desktop.

- [ ] **Step 3: Janelas de cena**

Rolar até o painel marcar frame 80.
Expected: overlay SharkNews em opacidade cheia, AI Agent invisível, trilho no segmento 2, rótulo `02 / 04`.

Rolar até frame 112.
Expected: os dois overlays invisíveis. É a folga de 12 frames entre as janelas.

Rolar até frame 140.
Expected: AI Agent em opacidade cheia, SharkNews invisível, trilho no segmento 3.

- [ ] **Step 4: Handoff**

Rolar devagar pelo último 2% da seção.
Expected: nenhuma mudança de imagem perceptível. O movimento para e a cidade fica. Se aparecer um pulo, conferir se `final-city.webp` veio do frame 239 e se o `object-fit` do fundo e o `cover` do canvas partem da mesma proporção.

- [ ] **Step 5: Canvas nunca vazio**

No DevTools, aba Network, aplicar throttling `Slow 3G` e recarregar.
Expected: o poster aparece imediatamente, depois o frame 0. Nenhum quadro branco ou preto em nenhum momento.

- [ ] **Step 6: Resize**

Com a página no meio do cinematic, arrastar a borda da janela de 1920 para 800 e voltar.
Expected: a imagem reenquadra sem deformar, e o frame em tela continua o mesmo.

- [ ] **Step 7: Reduced motion**

macOS: Ajustes, Acessibilidade, Tela, Reduzir movimento. Recarregar.
Expected: a seção do cinematic vira dois blocos estáticos legíveis, o scroll é normal, e o conteúdo de SharkNews e AI Agent continua acessível com CTA funcionando.

- [ ] **Step 8: Mobile e degradação**

DevTools, modo dispositivo, iPhone 14 Pro. Recarregar.
Expected: carrega o conjunto `mobile` (conferir em Network que os pedidos vão para `/cinematic/mobile/`), altura de scroll menor, sem travamento.

Ainda no modo dispositivo, aba Network, marcar `Slow 3G` e recarregar.
Expected: modo `static`, nenhum pedido para `/cinematic/mobile/frame-`, a cidade final visível e o site inteiro navegável.

- [ ] **Step 9: Memória**

DevTools, aba Memory, gravar alocação enquanto rola o cinematic inteiro duas vezes e depois até o rodapé.
Expected: o heap sobe durante o cinematic e volta perto do valor inicial depois do handoff. Se ficar retido, conferir se `dispose()` roda e se cada `ImageBitmap` recebe `close()`.

- [ ] **Step 10: Acessibilidade e SEO**

```bash
curl -s http://localhost:3000 | grep -c "SharkNews\|AI Agent\|SHK GROUP"
```
Expected: maior que zero. O conteúdo está no HTML da primeira resposta, sem depender do cinematic.

No DevTools, painel Elements: confirmar que existe exatamente um `<h1>` na página, que o canvas tem `aria-hidden="true"`, e que todo CTA é `<a>` com foco visível ao navegar por Tab.

- [ ] **Step 11: Fechar a spec**

Reler `docs/superpowers/specs/2026-08-19-shk-cinematic-site-design.md`, seção 15, e marcar cada critério cumprido. Qualquer item que não passar vira correção antes do commit final, não uma nota de rodapé.

- [ ] **Step 12: Commit final**

```bash
git add -A
git commit -m "Fecha os criterios de aceite do cinematic e do site institucional"
```
