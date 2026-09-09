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
import { CINEMATIC_COPY } from '@/lib/content/cinematic-copy';
import { useCinematicReady } from '@/lib/cinematic/cinematic-ready-context';
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

/**
 * Duração do boot-in do header após o handoff, em milissegundos.
 * O scroll livre só é liberado após esse tempo.
 */
const BOOT_IN_DURATION_MS = 900;

function CinematicStage() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const sharkRef = useRef<SceneHandle | null>(null);
  const agentRef = useRef<SceneHandle | null>(null);
  const railRef = useRef<SceneHandle | null>(null);
  const frameRef = useRef<number>(0);
  const tickRef = useRef<CinematicTick>({ progress: 0, frame: 0, scene: 'intro' });
  // Garante que markReady só dispara uma vez, mesmo com scroll errático.
  const handoffFiredRef = useRef(false);

  const [mode, setMode] = useState<CinematicMode | null>(null);
  const [frameSet, setFrameSet] = useState<FrameSetName>('desktop');
  const debugEnabled = useCinematicDebugEnabled();
  const { markReady } = useCinematicReady();

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

        // Quando o palco some completamente, dispara o boot-in do header.
        // O timeout reflete a duração da animação, após a qual o scroll é liberado.
        if (opacity === 0 && !handoffFiredRef.current) {
          handoffFiredRef.current = true;
          // Bloqueia scroll imediatamente para o boot-in ocorrer sem a página pular.
          document.documentElement.style.overflow = 'hidden';
          markReady();
          setTimeout(() => {
            document.documentElement.style.overflow = '';
          }, BOOT_IN_DURATION_MS);
        }
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
      <h1 className="sr-only">{CINEMATIC_COPY.pageHeading}</h1>

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
          {...CINEMATIC_COPY.sharknews}
        />
        <CinematicOverlay
          ref={agentRef}
          window={CINEMATIC.overlays.aiAgent}
          {...CINEMATIC_COPY.aiAgent}
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
  readonly meta: string;
}

/** Caminho de reduced-motion, save-data e conexão lenta. */
function StaticCinematic() {
  const { markReady } = useCinematicReady();

  // No caminho estático não há handoff cinematográfico: o header deve aparecer
  // imediatamente, sem animação de boot-in e sem bloqueio de scroll.
  useEffect(() => {
    markReady();
  }, [markReady]);

  const scenes: readonly SceneCopy[] = [
    CINEMATIC_COPY.sharknews,
    CINEMATIC_COPY.aiAgent,
  ];

  return (
    <section aria-label="SHK Group introduction" className="relative z-10">
      <h1 className="sr-only">{CINEMATIC_COPY.pageHeading}</h1>
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
        <span className="font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--accent)]">
          {scene.eyebrow}
        </span>
      </div>
      <h2 className="font-display text-[var(--text-display-md)] font-bold leading-[1.04] tracking-[var(--tracking-tight)] text-pretty max-md:text-[32px]">
        {scene.headline.join(' ')}
      </h2>
      <p className="max-w-[460px] text-[var(--text-body-lg)] leading-[1.62] text-[var(--paper)]" style={{ opacity: 0.85 }}>
        {scene.support}
      </p>
      <span className="font-mono text-[11px] tracking-[var(--tracking-snug)] text-[var(--accent)]" style={{ opacity: 0.7 }}>
        {scene.meta}
      </span>
    </div>
  );
}
