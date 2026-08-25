# Fullscreen Sections — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current scrollable sections after the cinematic with 6 fullscreen sections that transition via scroll hijacking with cyberpunk distortion effects.

**Architecture:** After the cinematic handoff (`useCinematicReady`), a `FullscreenSections` wrapper pins the viewport and captures wheel/touch events to advance between sections. Each transition plays a GSAP timeline with flicker + scan sweep + chromatic aberration. Sections are absolute-positioned screens that swap via class toggling.

**Tech Stack:** Next.js 16, React 19, GSAP ScrollTrigger, Tailwind v4, next/font (Chakra Petch + Rajdhani)

**Spec:** `docs/superpowers/specs/2026-08-25-fullscreen-sections-design.md`
**Mockup:** `.superpowers/brainstorm/2209-1787633619/all-sections.html`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/app/layout.tsx` | Replace fonts: Orbitron→Chakra Petch, Inter→Rajdhani, keep JetBrains Mono |
| Modify | `src/app/globals.css` | Update CSS variables: colors, typography scale, font-family refs |
| Modify | `src/lib/content/site-content.ts` | New copy for all sections + add Planos section data |
| Create | `src/lib/content/plans-content.ts` | Planos pricing data (Start, Pro, Obsidian) |
| Modify | `src/components/ui/PersistentCityBackground.tsx` | Use frame-0239.webp as static bg with overlay |
| Create | `src/components/sections/FullscreenSections.tsx` | Wrapper: scroll hijacking, section state, GSAP transitions |
| Create | `src/hooks/use-fullscreen-nav.ts` | Wheel/touch/keyboard event handler, debounce, section index state |
| Create | `src/components/sections/SectionScreen.tsx` | Single screen wrapper (absolute, transition classes) |
| Modify | `src/components/sections/ProductsSection.tsx` | Rework to fullscreen editorial-left layout |
| Modify | `src/components/sections/TechnologySection.tsx` | Rework to fullscreen terminal-list layout |
| Modify | `src/components/sections/AboutSection.tsx` | Add Victor Alves, rework to fullscreen |
| Modify | `src/components/sections/CasesSection.tsx` | Rework to fullscreen honest-empty state |
| Create | `src/components/sections/PlansSection.tsx` | 3 tiers editorial horizontal |
| Modify | `src/components/sections/ContactSection.tsx` | Rework to fullscreen CTA |
| Create | `src/components/effects/ScanlineOverlay.tsx` | Permanent VCR scanlines |
| Create | `src/components/effects/TransitionFX.tsx` | Flicker + scan sweep + chromatic aberration GSAP timeline |
| Create | `src/components/ui/SectionDots.tsx` | Navigation dots indicator |
| Modify | `src/app/page.tsx` | Replace section list with FullscreenSections wrapper |
| Modify | `src/components/layout/NavScrollSpy.tsx` | Update nav to work with section index instead of scroll position |
| Create | `src/components/sections/__tests__/FullscreenSections.test.tsx` | Integration tests |
| Create | `src/hooks/__tests__/use-fullscreen-nav.test.ts` | Hook unit tests |

---

### Task 1: Typography — Replace Fonts

**Files:**
- Modify: `src/app/layout.tsx:10-33`
- Modify: `src/app/globals.css:50-52, 73-79`

- [ ] **Step 1: Write test for font variables**

```tsx
// src/app/__tests__/layout.test.tsx
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('layout fonts', () => {
  const layout = readFileSync('src/app/layout.tsx', 'utf8')

  it('uses Chakra_Petch for display', () => {
    expect(layout).toContain('Chakra_Petch')
    expect(layout).toContain('--font-chakra-petch')
  })

  it('uses Rajdhani for body', () => {
    expect(layout).toContain('Rajdhani')
    expect(layout).toContain('--font-rajdhani')
  })

  it('does NOT use old fonts', () => {
    expect(layout).not.toContain('Orbitron')
    expect(layout).not.toContain("from 'next/font/google';\nimport { Inter }")
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test src/app/__tests__/layout.test.tsx`
Expected: FAIL — Orbitron still present

- [ ] **Step 3: Replace fonts in layout.tsx**

Replace the three font imports (lines 10-33) with:

```tsx
import { Chakra_Petch, Rajdhani, JetBrains_Mono } from 'next/font/google'

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  variable: '--font-chakra-petch',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-rajdhani',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['500'],
  display: 'swap',
})
```

Update the `<html>` className to use new variables.

- [ ] **Step 4: Update globals.css font references**

Replace lines 50-52:
```css
--font-display: var(--font-chakra-petch);
--font-body: var(--font-rajdhani);
--font-mono: var(--font-jetbrains-mono);
```

Update body rule (line 73+):
```css
body {
  font-family: var(--font-body), system-ui, sans-serif;
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm test src/app/__tests__/layout.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/app/__tests__/layout.test.tsx
git commit -m "feat: replace fonts with Chakra Petch + Rajdhani"
```

---

### Task 2: Color Palette — Teal Cyberpunk

**Files:**
- Modify: `src/app/globals.css:4-20`

- [ ] **Step 1: Update CSS variables to teal palette**

Replace the color variables block:

```css
--ink-900: #050607;
--ink-800: #080B0E;
--ink-700: #0E1318;
--paper: #e0f0ea;
--paper-dim: rgba(224, 240, 234, 0.60);
--accent: #00d4aa;
--accent-dim: #009977;
--accent-glow: rgba(0, 212, 170, 0.16);
--accent-pulse: rgba(0, 212, 170, 0.08);
--surface: rgba(4, 8, 12, 0.58);
--surface-border: rgba(0, 212, 170, 0.10);
--pro-accent: #a78bfa;
--obsidian-accent: #f59e0b;
```

- [ ] **Step 2: Add headline typography utility**

```css
.font-display-upper {
  font-family: var(--font-display), system-ui, sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
```

- [ ] **Step 3: Verify build compiles**

Run: `pnpm build`
Expected: Build succeeds, no CSS errors

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: teal cyberpunk color palette"
```

---

### Task 3: Content — New Copy + Planos Data

**Files:**
- Modify: `src/lib/content/site-content.ts`
- Create: `src/lib/content/plans-content.ts`

- [ ] **Step 1: Create plans-content.ts**

```tsx
export const PLANS = [
  {
    id: 'start',
    name: 'START',
    price: 'R$99,90',
    period: '/mês',
    accent: 'var(--accent)',
    tagline: 'A porta de entrada para automação inteligente.',
    features: [
      '1 canal (WhatsApp ou Instagram)',
      '1 funil de atendimento estruturado',
      '1 integração configurada',
      'Comportamento humanizado + memória',
    ],
    cta: { label: 'Começar', position: 'plans-start' as const },
    activation: 'Ativação em 48h',
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 'R$197,90',
    period: '/mês',
    accent: 'var(--pro-accent)',
    tagline: 'Para negócios que não podem perder nenhum lead.',
    badge: 'MAIS ESCOLHIDO',
    features: [
      'Tudo do Start',
      '2 canais simultâneos + 2 funis',
      '3 integrações (CRM, Google Agenda, planilhas)',
      'Reativação automática de leads frios',
      'Suporte prioritário em 4h',
    ],
    cta: { label: 'Assinar Pro', position: 'plans-pro' as const },
    activation: 'Ativação em 48h',
  },
  {
    id: 'obsidian',
    name: 'OBSIDIAN',
    price: 'R$547,90',
    period: '/mês',
    accent: 'var(--obsidian-accent)',
    tagline: 'Para quem constrói um negócio que não para.',
    badge: 'MEMBER',
    vagas: 'VAGAS LIMITADAS',
    features: [
      'Tudo do Pro, sem teto',
      'Canais e funis ilimitados',
      'Integrações avançadas (ERP, APIs, webhooks)',
      'IA treinada com a linguagem da sua marca',
      'Reunião mensal de estratégia',
    ],
    cta: { label: 'Entrar', position: 'plans-obsidian' as const },
    activation: 'Exclusivo',
  },
] as const
```

- [ ] **Step 2: Update site-content.ts with refined copy**

Add imports and new sections. Update existing copy to match the approved headlines from the spec. Add `plans` key importing from `plans-content.ts`. Update `products.items` array to include all 6 services (SharkNews, AI Agent, Tráfego Pago, Criação de Sites, Integrações APIs, Identidade Visual). Add Victor Alves to `about.founders`.

- [ ] **Step 3: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/content/plans-content.ts src/lib/content/site-content.ts
git commit -m "feat: new copy + plans pricing data"
```

---

### Task 4: Background — Frame 0239 as Static BG

**Files:**
- Modify: `src/components/ui/PersistentCityBackground.tsx`

- [ ] **Step 1: Read current PersistentCityBackground.tsx**
- [ ] **Step 2: Replace with frame-0239.webp background**

The component should render:
- `<div>` fixed inset-0 z-0
- `<img>` of `/cinematic/desktop/frame-0239.webp`, object-cover, opacity-35
- Overlay div with radial-gradient teal glow at bottom-center + darkening gradient

- [ ] **Step 3: Verify in browser**

Run: `pnpm dev` — check localhost:3000, city image visible behind content

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/PersistentCityBackground.tsx
git commit -m "feat: use cinematic last frame as persistent background"
```

---

### Task 5: Scroll Hijacking Hook

**Files:**
- Create: `src/hooks/use-fullscreen-nav.ts`
- Create: `src/hooks/__tests__/use-fullscreen-nav.test.ts`

- [ ] **Step 1: Write tests**

```tsx
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFullscreenNav } from '../use-fullscreen-nav'

describe('useFullscreenNav', () => {
  it('starts at section 0', () => {
    const { result } = renderHook(() => useFullscreenNav(6))
    expect(result.current.index).toBe(0)
  })

  it('advances on next()', () => {
    const { result } = renderHook(() => useFullscreenNav(6))
    act(() => result.current.next())
    expect(result.current.index).toBe(1)
  })

  it('does not exceed max', () => {
    const { result } = renderHook(() => useFullscreenNav(6))
    for (let i = 0; i < 10; i++) act(() => result.current.next())
    expect(result.current.index).toBe(5)
  })

  it('goes back on prev()', () => {
    const { result } = renderHook(() => useFullscreenNav(6))
    act(() => result.current.next())
    act(() => result.current.prev())
    expect(result.current.index).toBe(0)
  })

  it('does not go below 0', () => {
    const { result } = renderHook(() => useFullscreenNav(6))
    act(() => result.current.prev())
    expect(result.current.index).toBe(0)
  })

  it('goTo jumps directly', () => {
    const { result } = renderHook(() => useFullscreenNav(6))
    act(() => result.current.goTo(4))
    expect(result.current.index).toBe(4)
  })
})
```

- [ ] **Step 2: Run test, verify fail**

Run: `pnpm test src/hooks/__tests__/use-fullscreen-nav.test.ts`

- [ ] **Step 3: Implement hook**

```tsx
import { useState, useCallback, useEffect, useRef } from 'react'

const DEBOUNCE_MS = 800

export function useFullscreenNav(total: number) {
  const [index, setIndex] = useState(0)
  const lockRef = useRef(false)

  const next = useCallback(() => {
    if (lockRef.current) return
    setIndex(i => Math.min(i + 1, total - 1))
    lockRef.current = true
    setTimeout(() => { lockRef.current = false }, DEBOUNCE_MS)
  }, [total])

  const prev = useCallback(() => {
    if (lockRef.current) return
    setIndex(i => Math.max(i - 1, 0))
    lockRef.current = true
    setTimeout(() => { lockRef.current = false }, DEBOUNCE_MS)
  }, [])

  const goTo = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(i, total - 1)))
  }, [total])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0) next()
      else if (e.deltaY < 0) prev()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next()
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') prev()
    }

    let touchY = 0
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchY - e.changedTouches[0].clientY
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [next, prev])

  return { index, next, prev, goTo }
}
```

- [ ] **Step 4: Run test, verify pass**
- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-fullscreen-nav.ts src/hooks/__tests__/use-fullscreen-nav.test.ts
git commit -m "feat: scroll hijacking hook with wheel/touch/keyboard"
```

---

### Task 6: Transition Effects

**Files:**
- Create: `src/components/effects/ScanlineOverlay.tsx`
- Create: `src/components/effects/TransitionFX.tsx`

- [ ] **Step 1: Create ScanlineOverlay (permanent VCR effect)**

```tsx
export function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        background: `repeating-linear-gradient(
          to bottom,
          transparent 0px, transparent 3px,
          rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px
        )`,
        animation: 'scanRoll 10s linear infinite',
      }}
    />
  )
}
```

Add `@keyframes scanRoll` to globals.css.

- [ ] **Step 2: Create TransitionFX (GSAP timeline)**

Component that exposes a `play()` method via ref. When called, runs a GSAP timeline:
1. Flicker: opacity flash 4x in 0.3s
2. Scan sweep: teal line top→bottom in 0.6s
3. Chromatic aberration: red/teal text-shadow on headlines, converge to 0 in 0.4s

Uses `gsap.timeline()` with `onComplete` callback.

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/ScanlineOverlay.tsx src/components/effects/TransitionFX.tsx src/app/globals.css
git commit -m "feat: cyberpunk transition effects (scanlines, flicker, scan sweep)"
```

---

### Task 7: Section Components — Fullscreen Rework

**Files:** All 6 section components in `src/components/sections/`

- [ ] **Step 1: Create SectionScreen wrapper**

Wrapper div: absolute inset-0, opacity 0 by default, opacity 1 + pointer-events when active. Accepts `active` prop.

- [ ] **Step 2: Rework ProductsSection**

Editorial-left layout: headline left (Chakra Petch, 64px), 6 service items right separated by teal dividers. Read existing component first, preserve whatsappHref CTA.

- [ ] **Step 3: Rework TechnologySection**

Headline bottom-left, numbered capability list right in terminal style.

- [ ] **Step 4: Rework AboutSection**

Add Victor Alves data alongside Rafael Alvarenga. Two founder cards on right.

- [ ] **Step 5: Rework CasesSection**

Honest empty state. Large headline, placeholder blocks.

- [ ] **Step 6: Create PlansSection**

3 horizontal tier rows from `plans-content.ts`. Each row: plan name huge left + features center + price/CTA right. Separated by 1px teal dividers.

- [ ] **Step 7: Rework ContactSection**

Full-width, mega headline, single CTA dominant.

- [ ] **Step 8: Run typecheck + build**

Run: `pnpm tsc --noEmit && pnpm build`

- [ ] **Step 9: Commit**

```bash
git add src/components/sections/ src/components/ui/SectionScreen.tsx
git commit -m "feat: fullscreen section components with cyberpunk layout"
```

---

### Task 8: FullscreenSections Wrapper + Page Integration

**Files:**
- Create: `src/components/sections/FullscreenSections.tsx`
- Create: `src/components/ui/SectionDots.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/NavScrollSpy.tsx`

- [ ] **Step 1: Create SectionDots**

Fixed right-center, 6 small dots. Active dot = `--accent` filled. Clickable to goTo(i).

- [ ] **Step 2: Create FullscreenSections**

```tsx
'use client'
import { useFullscreenNav } from '@/hooks/use-fullscreen-nav'
import { useCinematicReady } from '@/lib/cinematic/cinematic-ready-context'
// ... section imports

const SECTIONS = [
  ProductsSection,
  TechnologySection,
  AboutSection,
  CasesSection,
  PlansSection,
  ContactSection,
] as const

export function FullscreenSections() {
  const { ready } = useCinematicReady()
  const { index, next, prev, goTo } = useFullscreenNav(SECTIONS.length)
  const fxRef = useRef<TransitionFXHandle>(null)

  // Play FX on section change
  useEffect(() => { fxRef.current?.play() }, [index])

  if (!ready) return null

  return (
    <div className="fixed inset-0 top-0 z-10">
      {SECTIONS.map((Section, i) => (
        <SectionScreen key={i} active={i === index}>
          <Section />
        </SectionScreen>
      ))}
      <SectionDots total={SECTIONS.length} current={index} onDotClick={goTo} />
      <TransitionFX ref={fxRef} />
    </div>
  )
}
```

- [ ] **Step 3: Update page.tsx**

Replace the individual section components with `<FullscreenSections />`. Keep `CinematicExperience` above. Remove `InstitutionalIntro` (content merged into Sobre).

- [ ] **Step 4: Update NavScrollSpy**

Instead of scroll-position-based active link, use the section index from a shared context or prop.

- [ ] **Step 5: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 6: Run build**

Run: `pnpm build`
Expected: 7 static routes, no errors

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/FullscreenSections.tsx src/components/ui/SectionDots.tsx src/app/page.tsx src/components/layout/NavScrollSpy.tsx
git commit -m "feat: fullscreen sections with scroll hijacking and cyberpunk transitions"
```

---

### Task 9: Visual QA + Copy Refinement

- [ ] **Step 1: Desktop visual QA**

Check all 6 sections at 1920x1080. Verify: typography, colors, background, transitions, dots nav.

- [ ] **Step 2: Mobile visual QA**

Check at 390x844. Verify: touch swipe, responsive layouts, font sizes.

- [ ] **Step 3: Refine copy**

Review all headlines and body text. Replace placeholder copy with final versions. Ensure tom direto, sem perfumaria.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "polish: visual QA fixes and copy refinement"
```

---

### Task 10: PR

- [ ] **Step 1: Push branch and create PR**

```bash
git push -u origin feat/fullscreen-sections
gh pr create --title "Seções fullscreen com transições cyberpunk" --body "..."
```

**DO NOT merge.** PR is Rafa's validation channel.
