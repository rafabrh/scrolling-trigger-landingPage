'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { CINEMATIC, SCENE_ORDER, type SceneKey } from '@/lib/cinematic/cinematic.config';
import { sceneAtFrame } from '@/lib/cinematic/frame-math';
import type { SceneHandle } from './CinematicOverlay';

/**
 * Só as cenas com texto de overlay (sharknews, aiAgent) têm carga narrativa;
 * intro e cityReveal são transições sem payoff. O trilho reflete isso: as duas
 * cenas de conteúdo ganham segmento cheio, as transições ficam menores e mais
 * apagadas, para o trilho não ler como quatro passos iguais e mentir sobre a
 * estrutura. Deriva de CINEMATIC.overlays: cena com janela de overlay é de
 * conteúdo.
 */
const CONTENT_SCENES = new Set<SceneKey>(
  Object.keys(CINEMATIC.overlays) as SceneKey[],
);

/**
 * Único elemento de HUD do cinematic. Uma seção de 500vh sem referência de
 * posição deixa o usuário sem saber quanto falta; o trilho resolve isso.
 *
 * Como o overlay, não guarda estado: `apply` escreve `background` e
 * `textContent` direto nos nós, porque quem chama é o tick da timeline.
 */
export const SceneRail = forwardRef<SceneHandle>(function SceneRail(_props, ref) {
  const segmentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useImperativeHandle(ref, () => ({
    apply(frame: number) {
      const active = sceneAtFrame(frame, CINEMATIC.scenes);
      const activeIndex = SCENE_ORDER.indexOf(active);

      segmentRefs.current.forEach((node, index) => {
        if (!node) return;
        if (index === activeIndex) {
          node.style.background = 'var(--accent)';
          return;
        }
        // Inativo: preserva a hierarquia conteúdo/transição do estado de repouso.
        const isContent = CONTENT_SCENES.has(SCENE_ORDER[index]!);
        node.style.background = isContent ? 'rgba(245,247,248,0.22)' : 'rgba(245,247,248,0.1)';
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
      className="absolute right-[60px] top-1/2 flex -translate-y-1/2 flex-col items-end gap-[18px] max-md:right-5"
    >
      <span ref={labelRef} className="font-mono text-[10px] tracking-[var(--tracking-wide)] text-[var(--paper-dim)]">
        01 / 04
      </span>
      <div className="flex flex-col gap-[9px]">
        {SCENE_ORDER.map((scene, index) => {
          // Cena de conteúdo: segmento cheio e opaco. Transição: mais curta e
          // apagada, para o trilho revelar que só duas cenas têm payoff.
          const isContent = CONTENT_SCENES.has(scene);
          return (
            <div
              key={scene}
              ref={(node) => {
                segmentRefs.current[index] = node;
              }}
              className={`w-0.5 transition-colors duration-200 ${
                isContent ? 'h-10 max-md:h-6' : 'h-4 max-md:h-2.5'
              }`}
              style={{ background: isContent ? 'rgba(245,247,248,0.22)' : 'rgba(245,247,248,0.1)' }}
            />
          );
        })}
      </div>
    </div>
  );
});
