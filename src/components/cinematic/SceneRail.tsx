'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { CINEMATIC, SCENE_ORDER } from '@/lib/cinematic/cinematic.config';
import { sceneAtFrame } from '@/lib/cinematic/frame-math';
import type { SceneHandle } from './CinematicOverlay';

/**
 * Record<string, never> parece o jeito de dizer "sem props", mas ele tipa
 * toda chave como never, e `ref` e uma delas: o componente fica impossivel
 * de referenciar. Uma prop opcional real resolve.
 */
export interface SceneRailProps {
  readonly className?: string;
}

/**
 * Único elemento de HUD do cinematic. Uma seção de 500vh sem referência de
 * posição deixa o usuário sem saber quanto falta; o trilho resolve isso.
 *
 * Como o overlay, não guarda estado: `apply` escreve `background` e
 * `textContent` direto nos nós, porque quem chama é o tick da timeline.
 */
export const SceneRail = forwardRef<SceneHandle, SceneRailProps>(function SceneRail({ className }, ref) {
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
        labelRef.current.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(
          SCENE_ORDER.length,
        ).padStart(2, '0')}`;
      }
    },
  }));

  return (
    <div
      aria-hidden="true"
      className={`absolute right-[60px] top-1/2 flex -translate-y-1/2 flex-col items-end gap-[18px] max-md:right-5 ${className ?? ''}`}
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
