'use client';

import { useEffect, useRef, useState } from 'react';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';
import { useFrameSequence } from '@/lib/cinematic/use-frame-sequence';
import { useCinematicTimeline, type CinematicTick } from '@/lib/cinematic/use-cinematic-timeline';
import { useCinematicDebugEnabled } from '@/lib/cinematic/use-cinematic-debug';
import {
  readEnvironmentSignals,
  resolveCinematicMode,
  resolveFrameSet,
  type CinematicMode,
  type FrameSetName,
} from '@/lib/env/device';
import { SITE_CONTENT } from '@/lib/content/site-content';
import { GrainOverlay } from '@/components/background/GrainOverlay';
import { CinematicCanvas } from './CinematicCanvas';
import { CinematicOverlay, type SceneHandle } from './CinematicOverlay';
import { SceneRail } from './SceneRail';
import { CinematicDebugPanel } from './CinematicDebugPanel';
import { CinematicErrorBoundary } from './CinematicErrorBoundary';

/**
 * O palco some nos últimos frames, revelando a cidade idêntica que está
 * montada atrás dele desde o primeiro paint.
 *
 * Ancorado em frame, não em progresso de scroll. Com peso por cena os dois
 * deixaram de ser proporcionais, e o que o olho vê é o frame: amarrar o fade
 * ao progresso deixaria o canvas ainda percorrendo quadros visivelmente
 * diferentes enquanto faz crossfade contra um fundo estático, produzindo
 * imagem fantasma no lugar da troca invisível.
 */
const HANDOFF_FRAME_SPAN = 3;

/**
 * Ponto de entrada da ilha. Envolve o palco num error boundary com o caminho
 * estático como fallback: uma falha de cliente no cinematic não pode derrubar
 * as seis seções institucionais que estão logo abaixo.
 */
export function CinematicExperience() {
  return (
    <CinematicErrorBoundary fallback={<StaticCinematic />}>
      <CinematicStage />
    </CinematicErrorBoundary>
  );
}

function CinematicStage() {
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

  // Os sinais são lidos uma vez depois da montagem. Trocar de conjunto no meio
  // do scroll descartaria o cache inteiro por causa de um resize de barra de
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

      // O palco apaga sobre a cidade em vez de a cidade acender sobre o palco.
      // Como o último frame do canvas e a imagem de fundo são o mesmo frame
      // 239, no mesmo cover e no mesmo viewport, não há o que o olho detecte.
      const stage = stageRef.current;
      if (stage) {
        const start = CINEMATIC.finalFrame - HANDOFF_FRAME_SPAN;
        const t = (tick.frame - start) / HANDOFF_FRAME_SPAN;
        const opacity = 1 - Math.min(1, Math.max(0, t));

        stage.style.opacity = String(opacity);
        // Opacidade zero não tira do fluxo: sem isto o usuário de teclado
        // tabula para dentro de CTAs invisíveis e o clique morre no palco.
        stage.style.pointerEvents = opacity === 0 ? 'none' : '';
        stage.style.visibility = opacity === 0 ? 'hidden' : '';
      }
    },
  });

  const heightVh =
    frameSet === 'mobile' ? CINEMATIC.scrollHeightVh.mobile : CINEMATIC.scrollHeightVh.desktop;

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
      <h1 className="sr-only">{SITE_CONTENT.pageHeading}</h1>

      <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <CinematicCanvas
          cache={cache}
          frameRef={frameRef}
          sourceWidth={set.width}
          sourceHeight={set.height}
          className="absolute inset-0 h-full w-full"
        />

        {!ready && (
          // Poster do frame 0 enquanto o primeiro bitmap não chega. Vem depois
          // do canvas no JSX de propósito: sem z-index, quem pinta por último
          // fica por cima, então o poster cobre o preto opaco do contexto 2D
          // criado com alpha:false até o primeiro bitmap decodificar. Fica antes
          // dos gradientes para ser escurecido igual ao canvas. O canvas nunca
          // aparece vazio.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={CINEMATIC.assets.poster}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(5,6,7,0.94)_0%,rgba(5,6,7,0.72)_34%,rgba(5,6,7,0.16)_68%,rgba(5,6,7,0.42)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,6,7,0.86)_0%,rgba(5,6,7,0)_42%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,rgba(5,6,7,0)_38%,rgba(5,6,7,0.72)_100%)]" />
        <GrainOverlay />

        <CinematicOverlay
          ref={sharkRef}
          window={CINEMATIC.overlays.sharknews}
          {...SITE_CONTENT.cinematic.sharknews}
        />
        <CinematicOverlay
          ref={agentRef}
          window={CINEMATIC.overlays.aiAgent}
          {...SITE_CONTENT.cinematic.aiAgent}
        />
        <SceneRail ref={railRef} />
      </div>

      {debugEnabled && <CinematicDebugPanel tickRef={tickRef} cache={cache} />}
    </section>
  );
}

/**
 * Forma comum das duas cenas do cinematic. Amarrar ao literal de uma delas
 * nao funciona: com `as const` cada cena tem tipo proprio, e `eyebrow:
 * 'AI Agent'` nao e atribuivel a `eyebrow: 'SharkNews'`.
 */
interface SceneCopy {
  readonly eyebrow: string;
  readonly headline: readonly string[];
  readonly support: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly meta: string;
}

/** Caminho de reduced-motion, save-data e conexão lenta. */
function StaticCinematic() {
  const scenes: readonly SceneCopy[] = [
    SITE_CONTENT.cinematic.sharknews,
    SITE_CONTENT.cinematic.aiAgent,
  ];

  return (
    <section aria-label="SHK Group introduction" className="relative z-10">
      <h1 className="sr-only">{SITE_CONTENT.pageHeading}</h1>
      {scenes.map((scene) => (
        <div key={scene.eyebrow} className="flex min-h-screen items-center px-24 max-md:px-6">
          <StaticScene scene={scene} />
        </div>
      ))}
    </section>
  );
}

function StaticScene({ scene }: { scene: SceneCopy }) {
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
      <p className="max-w-[460px] text-[17px] leading-[1.62] text-[var(--paper-dim)]">
        {scene.support}
      </p>
      <a
        href={scene.ctaHref}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex w-fit items-center gap-3 border border-[var(--accent)] bg-[var(--accent-glow)] px-7 py-[15px] text-[13px] font-medium uppercase tracking-[0.1em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        {scene.ctaLabel}
      </a>
    </div>
  );
}
