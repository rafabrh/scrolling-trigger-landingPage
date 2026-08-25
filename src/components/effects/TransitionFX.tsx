'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';

export interface TransitionFXHandle {
  play: () => void;
}

/**
 * Overlay de transição com três efeitos sequenciais:
 * 1. Flicker — opacidade pisca 4× em ~0.3s
 * 2. Scan sweep — linha teal varre de cima pra baixo em 0.6s
 * 3. Chromatic aberration — text-shadow vermelho/teal em .font-display-upper converge a zero em 0.4s
 *
 * Uso: ref.current.play() antes de trocar de seção.
 */
export const TransitionFX = forwardRef<TransitionFXHandle>(function TransitionFX(_, ref) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    play() {
      const overlay = overlayRef.current;
      const line = lineRef.current;
      if (!overlay || !line) return;

      const tl = gsap.timeline();

      // 1. Flicker — 4 piscadas em ~0.3s
      tl.to(overlay, { opacity: 0.55, duration: 0.05, ease: 'none' })
        .to(overlay, { opacity: 0, duration: 0.05, ease: 'none' })
        .to(overlay, { opacity: 0.7, duration: 0.05, ease: 'none' })
        .to(overlay, { opacity: 0, duration: 0.05, ease: 'none' })
        .to(overlay, { opacity: 0.4, duration: 0.05, ease: 'none' })
        .to(overlay, { opacity: 0, duration: 0.05, ease: 'none' });

      // 2. Scan sweep — linha teal de cima a baixo em 0.6s
      tl.fromTo(
        line,
        { top: '0%', opacity: 1 },
        { top: '100%', opacity: 0, duration: 0.6, ease: 'none' },
        '<0.05',
      );

      // 3. Chromatic aberration — split R/teal converge a zero em 0.4s
      const headlines = document.querySelectorAll<HTMLElement>('.font-display-upper');
      if (headlines.length > 0) {
        tl.fromTo(
          headlines,
          { textShadow: '-4px 0 #ff003c, 4px 0 #00d4aa' },
          {
            textShadow: '0px 0 transparent, 0px 0 transparent',
            duration: 0.4,
            ease: 'power2.out',
          },
          '<',
        );
      }
    },
  }));

  return (
    <>
      {/* Flicker overlay — cobertura escura que pisca */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[200]"
        style={{ background: '#000', opacity: 0 }}
      />
      {/* Scan sweep line */}
      <div
        ref={lineRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 right-0 z-[201]"
        style={{
          height: '2px',
          background: '#00d4aa',
          boxShadow: '0 0 15px #00d4aa, 0 0 40px rgba(0,212,170,0.3)',
          top: '0%',
          opacity: 0,
        }}
      />
    </>
  );
});
