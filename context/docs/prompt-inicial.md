You are building the new institutional website for **SHK GROUP**, a Brazilian technology company focused on AI, automation, software and digital products.

The project includes a finished cinematic cyberpunk video asset that will define the opening experience of the website.

Your job is to build a **production-grade, scroll-driven institutional website around this video**.

Do not redesign or regenerate the video.

Use it as the visual foundation.

---

# 1. FIRST: INSPECT THE PROJECT AND VIDEO

Before coding:

* inspect the existing repository;
* locate the provided cinematic video;
* inspect its real duration, FPS, resolution, codec and frame count;
* inspect the existing Next.js/CSS/Tailwind structure;
* identify available dependencies;
* check whether FFmpeg is available.

Do not invent paths or metadata.

Then create a short implementation plan and proceed.

Do not ask questions that can be answered by inspecting the repository.

---

# 2. TECHNOLOGY

Prefer:

* Next.js App Router
* React
* TypeScript strict
* GSAP
* GSAP ScrollTrigger
* HTML5 Canvas 2D
* Tailwind only if already used by the project

Do not introduce Three.js for this experience.

Use Client Components only where browser APIs are required.

Keep the rest of the page server-renderable whenever possible.

---

# 3. CORE EXPERIENCE

The opening of the website is a cinematic scroll experience.

The video must **NOT play normally**.

Do not build the primary experience around:

```ts
video.play()
```

or continuous `video.currentTime` seeking.

Instead:

```text
VIDEO
  ↓
FRAME SEQUENCE
  ↓
CANVAS
  ↓
GSAP SCROLLTRIGGER
  ↓
USER SCROLL CONTROLS FRAME
```

Convert the source video into an optimized image sequence such as WebP.

The user's scroll position must directly control the displayed frame.

Scrolling forward advances the cinematic.

Scrolling backward reverses it naturally.

Use smooth scrub, approximately:

```ts
scrub: 0.25–0.35
```

and:

```ts
ease: "none"
```

---

# 4. CINEMATIC STRUCTURE

The visual sequence contains four conceptual stages:

```text
INTRO DIVE
    ↓
SHARKNEWS
    ↓
AI AGENT
    ↓
FINAL CITY REVEAL
```

Do not hardcode scene boundaries throughout the codebase.

Create centralized configuration.

Initial conceptual mapping:

```ts
intro:      0.00 → 0.18
newsletter: 0.18 → 0.47
aiAgent:    0.47 → 0.76
cityReveal: 0.76 → 1.00
```

After inspecting the actual video, calibrate these ranges against the real frames.

Support absolute frame configuration as well:

```ts
newsletter: {
  startFrame,
  peakFrame,
  endFrame
}
```

This must be easy to fine-tune later.

---

# 5. SCROLL CONTAINER

Create one master cinematic section approximately:

```css
height: 500vh;
```

Make this configurable.

Inside it, use a sticky full-screen stage:

```css
position: sticky;
top: 0;
width: 100%;
height: 100vh;
overflow: hidden;
```

The Canvas fills the viewport.

Use **one primary ScrollTrigger** to coordinate:

* frame playback;
* Newsletter overlay;
* AI Agent overlay;
* final city transition.

Avoid many independent triggers competing with each other.

---

# 6. CANVAS FRAME RENDERER

Render frames through a `<canvas>`.

The Canvas is decorative:

```html
aria-hidden="true"
```

Support `devicePixelRatio`.

Preserve the original image aspect ratio using behavior equivalent to:

```css
object-fit: cover;
```

Create a reusable helper such as:

```ts
drawCoverImage()
```

Never stretch frames.

Do not use React state for every frame.

Use refs and `requestAnimationFrame`.

React must not rerender the application 24–60 times per second during scroll.

---

# 7. FRAME LOADING

Do not preload the entire sequence before showing the page.

Use progressive loading.

Priority:

1. first frame;
2. final city frame;
3. first ~20–30 frames;
4. frames around the current playhead;
5. upcoming scene;
6. remaining frames.

Use a cache such as:

```ts
Map<number, HTMLImageElement>
```

If the requested frame is unavailable, display the nearest loaded frame.

Never flash an empty Canvas.

Provide a subtle first-frame poster while the cinematic initializes.

---

# 8. PRODUCT OVERLAYS

All product information must remain **real HTML**, not baked into Canvas frames.

This is required for:

* SEO;
* accessibility;
* responsiveness;
* interactions;
* maintainability.

The cinematic provides emotion.

The HTML provides meaning.

---

# 9. PRODUCT 01 — SHARKNEWS

Official positioning:

**SharkNews** is SHK GROUP's technology newsletter covering:

* technology;
* artificial intelligence;
* innovation;
* curated relevant news;
* quick insights;
* useful tools/resources;
* daily delivery at **7:07**;
* free subscription.

Use concise cinematic copy such as:

Eyebrow:

```text
SHARKNEWS
```

Headline:

```text
What matters in technology,
before your day begins.
```

Supporting text:

```text
Technology, AI and innovation,
curated daily at 7:07.
```

CTA:

```text
Get SharkNews
```

This copy can be refined later.

Do not overload this scene with feature descriptions.

Animate the overlay subtly:

```text
opacity 0 → 1
translateY 24px → 0
blur 8px → 0
```

Then fade it out before the AI Agent scene begins.

---

# 10. PRODUCT 02 — AI AGENT

The SHK AI Agent transforms **WhatsApp and Instagram** into intelligent customer service and sales channels.

Relevant capabilities include:

* fast automated responses;
* lead qualification;
* sales funnel progression;
* handling customer questions;
* operation outside normal business hours;
* text and image interactions;
* audio interpretation;
* Instagram comments → Direct flows;
* payment links;
* Pix;
* scheduling;
* contact capture;
* CRM/spreadsheet integration;
* conversational context memory.

Do not display all of these inside the cinematic.

The cinematic only introduces the product.

Suggested overlay:

Eyebrow:

```text
AI AGENT
```

Headline:

```text
Conversations that move
toward conversion.
```

Supporting text:

```text
AI for WhatsApp and Instagram that responds,
qualifies, automates and advances every opportunity.
```

CTA:

```text
Explore AI Agent
```

Do not invent metrics, customers, revenue numbers or unsupported claims.

---

# 11. FINAL CITY HANDOFF

The end of the cinematic is extremely important.

Near the end of the source video, the camera reaches an open futuristic city landscape.

Inspect the frames and select the best stable panoramic frame.

Do not automatically use the literal final frame if another nearby frame is visually cleaner.

Extract it separately as something similar to:

```text
/public/cinematic/final-city.webp
```

At the end of the scroll sequence:

```text
CANVAS FINAL FRAME
       ↓
SUBTLE CROSSFADE
       ↓
FINAL CITY BACKGROUND
```

Target crossfade:

```text
150–300ms
```

The user must not perceive:

```text
video ended → image appeared
```

It should feel like the cinematic simply stopped moving and became the world behind the website.

---

# 12. THE CITY BECOMES THE WEBSITE BACKGROUND

After the cinematic section finishes, scrolling returns to normal document flow.

The final city landscape remains fixed behind the entire institutional website.

Architecture:

```text
CinematicExperience
        ↓
FinalCityTransition
        ↓
PersistentCityBackground
        ↓
Institutional Website
```

Create:

```tsx
<PersistentCityBackground />
```

Use:

```css
position: fixed;
inset: 0;
```

Add controlled layers:

* final city image;
* dark overlay;
* vignette;
* vertical gradients;
* optional extremely subtle ambient texture.

Do not hide the city behind fully opaque sections.

---

# 13. INSTITUTIONAL SITE STRUCTURE

Build the initial skeleton for:

```text
Header / Navigation

Institutional Intro

Products
  - SharkNews
  - AI Agent

Technology / Capabilities

About SHK

Cases / Future Proof Area

Contact / CTA

Footer
```

Use placeholders only where real content is not yet available.

Do not fabricate cases, clients, metrics, testimonials or certifications.

---

# 14. VISUAL LANGUAGE AFTER THE CINEMATIC

The website must feel like it belongs inside the same cyberpunk world.

Direction:

```text
premium
dark
enterprise technology
cinematic
minimal
high contrast
cyan electric accents
```

Suggested base palette:

```text
#050607
#090C0F
#10151A
#F5F7F8
```

Primary accent:

```text
electric cyan / aqua
```

Use translucent dark surfaces sparingly:

```css
background: rgba(5, 8, 12, 0.58);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.08);
```

Do not turn every section into a glass card.

Preserve negative space and allow the city to remain visible.

Avoid:

* generic purple AI gradients;
* excessive neon;
* cyberpunk clutter;
* excessive glow;
* gaming UI aesthetics.

---

# 15. COMPONENT ARCHITECTURE

Keep responsibilities separated.

Suggested structure:

```text
components/
  cinematic/
    CinematicExperience.tsx
    CinematicCanvas.tsx
    CinematicOverlay.tsx
    NewsletterScene.tsx
    AiAgentScene.tsx
    FinalCityTransition.tsx
    cinematic.config.ts
    useFrameSequence.ts
    useCinematicTimeline.ts
    frame-utils.ts

  background/
    PersistentCityBackground.tsx

  layout/
    SiteHeader.tsx

  sections/
    InstitutionalIntro.tsx
    ProductsSection.tsx
    TechnologySection.tsx
    AboutSection.tsx
    CasesSection.tsx
    ContactSection.tsx
```

Improve this structure if the existing repository suggests a better convention.

Do not create one huge cinematic component.

---

# 16. PERFORMANCE

Performance is a first-class requirement.

Do not make initial rendering wait for every frame.

Measure generated frame sizes.

If needed, compare:

```text
24 fps
18 fps
15 fps
```

Only reduce frame density if the result remains visually smooth.

Do not blindly sacrifice visual quality.

Provide architecture for separate desktop/mobile frame sets.

---

# 17. MOBILE

Desktop receives the full cinematic experience.

Mobile must remain performant.

Support a future structure such as:

```text
/cinematic/desktop/
/cinematic/mobile/
```

If the full frame sequence is too expensive on a device, gracefully fall back to:

* reduced sequence;
* poster/final city;
* simpler HTML transitions.

Do not destroy mobile UX to preserve desktop effects.

---

# 18. REDUCED MOTION

Respect:

```css
prefers-reduced-motion: reduce
```

In reduced-motion mode:

skip the intense cinematic scrub.

Show the final city state quickly and allow normal access to the institutional content.

---

# 19. AUDIO

The website is intentionally silent.

Do NOT implement:

* music;
* sound effects;
* AudioContext;
* audio synchronization;
* autoplay audio;
* mute controls.

Ignore/remove the source video's audio entirely.

---

# 20. DEBUG MODE

Create a development-only cinematic debug mode.

For example:

```text
?cinematicDebug=true
```

Show:

```text
Progress: 54.2%
Frame: 129 / 239
Scene: AI_AGENT
Loaded frames: 174
```

This will be used later for frame-perfect calibration.

Never show this in production by default.

---

# 21. ACCESSIBILITY AND SEO

The Canvas is decorative.

Critical information must exist as semantic HTML.

Use proper heading hierarchy.

Buttons must be real accessible buttons/links.

The cinematic must not prevent indexing or access to site content.

Do not delay essential DOM content until the animation completes.

---

# 22. ENGINEERING QUALITY

Use:

* TypeScript strict;
* semantic naming;
* small focused functions;
* centralized configuration;
* no unnecessary `any`;
* no duplicated constants;
* no magic numbers scattered throughout files;
* correct GSAP cleanup;
* resize handling;
* requestAnimationFrame cleanup;
* memory-safe image caching.

Use `gsap.context()` and clean ScrollTrigger correctly on unmount.

---

# 23. TEST IMPORTANT PURE LOGIC

Create useful tests for functions such as:

```ts
frameFromProgress()
getSceneProgress()
clampFrame()
drawCoverDimensions()
```

Do not create meaningless tests only for coverage.

---

# 24. ACCEPTANCE CRITERIA

The initial implementation is complete when:

* the source video has been inspected;
* the frame extraction pipeline exists;
* scroll controls Canvas frames smoothly;
* reverse scrolling works;
* SharkNews appears at the correct cinematic moment;
* AI Agent appears at the correct cinematic moment;
* scenes never visually compete;
* no audio exists;
* frames load progressively;
* first paint does not wait for the full sequence;
* Canvas maintains correct aspect ratio;
* final city transition is visually seamless;
* the city remains fixed behind the institutional website;
* institutional sections scroll normally over the city;
* desktop resize works;
* reduced motion works;
* mobile has a safe strategy;
* debug mode exposes progress/frame/scene;
* there are no obvious memory leaks or ScrollTrigger lifecycle issues.

---

# FINAL EXPERIENCE

The final user journey should feel like:

```text
ENTER SHK
   ↓
CYBERPUNK CITY DIVE
   ↓
SHARKNEWS
   ↓
AI AGENT
   ↓
CITY OPENS
   ↓
MOTION STOPS
   ↓
THE CITY BECOMES THE WEBSITE
   ↓
SHK INSTITUTIONAL EXPERIENCE
```

The goal is not to create a website with a video on top.

The goal is to make the cinematic sequence become the entrance into the SHK digital universe, and then seamlessly transform that universe into the permanent visual environment of the institutional website.

Prioritize:

1. cinematic continuity;
2. precise scroll/frame control;
3. performance;
4. engineering quality;
5. visual restraint;
6. accessibility;
7. maintainability.

Inspect first. Plan briefly. Then implement incrementally and validate each phase before moving forward.