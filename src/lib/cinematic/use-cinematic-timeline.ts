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
