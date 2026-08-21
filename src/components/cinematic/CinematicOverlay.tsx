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
 * A opacidade é escrita direto no DOM pelo tick da timeline, sem estado React:
 * `apply` roda até 60 vezes por segundo e um `setState` aqui rerenderizaria a
 * árvore inteira a cada frame. `pointer-events` acompanha a visibilidade para o
 * CTA invisível não roubar clique do que está embaixo.
 */
export const CinematicOverlay = forwardRef<SceneHandle, CinematicOverlayProps>(
  function CinematicOverlay(
    { window: overlayWindow, eyebrow, headline, support, ctaLabel, ctaHref, meta },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
      apply(frame: number) {
        const node = rootRef.current;
        if (!node) return;

        const opacity = getOverlayOpacity(frame, overlayWindow);
        const hidden = opacity <= 0.9;

        node.style.opacity = String(opacity);
        node.style.transform = `translate3d(0, ${((1 - opacity) * TRAVEL_PX).toFixed(2)}px, 0)`;
        node.style.filter = opacity >= 1 ? 'none' : `blur(${((1 - opacity) * BLUR_PX).toFixed(2)}px)`;
        node.style.pointerEvents = hidden ? 'none' : 'auto';
        // `pointer-events: none` bloqueia o mouse e nao tira do tab order. Sem
        // `inert`, quem navega por teclado cai em dois CTAs invisiveis cujo
        // proprio anel de foco tambem esta em opacidade zero, e perde o foco
        // de vista sem saber onde ele foi parar.
        node.toggleAttribute('inert', hidden);
      },
    }));

    return (
      <div
        ref={rootRef}
        inert
        style={{ opacity: 0, pointerEvents: 'none' }}
        className="absolute bottom-[132px] left-[96px] flex max-w-[660px] flex-col gap-[26px] will-change-[opacity,transform] max-md:bottom-16 max-md:left-6 max-md:right-6"
      >
        <Eyebrow>{eyebrow}</Eyebrow>

        <h2 className="font-display text-[var(--text-display-lg)] font-semibold leading-[1.08] tracking-[var(--tracking-tight)] text-[var(--paper)] text-pretty max-md:text-[34px]">
          {headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <p className="max-w-[430px] text-[var(--text-body-lg)] leading-[1.62] text-[var(--paper-dim)] max-md:text-[15px]">
          {support}
        </p>

        <div className="mt-1.5 flex items-center gap-6 max-md:flex-col max-md:items-start max-md:gap-4">
          <CtaLink href={ctaHref}>{ctaLabel}</CtaLink>
          <span className="font-mono text-[11px] tracking-[var(--tracking-snug)] text-[var(--paper-dim)]">{meta}</span>
        </div>
      </div>
    );
  },
);
