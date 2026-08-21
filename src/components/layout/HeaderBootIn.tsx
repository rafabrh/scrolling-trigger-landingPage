'use client';

import { useEffect, useRef } from 'react';
import { useCinematicReady } from '@/lib/cinematic/cinematic-ready-context';

/**
 * Anime os filhos do header quando o cinematic termina.
 *
 * O motion é "boot-in": cada item cai do topo com stagger, como se o header
 * estivesse inicializando. É ativado pelo sinal de ready do cinematic;
 * antes disso os elementos ficam ocultos (opacity 0, translateY negativo).
 *
 * Usa Web Animations API em vez de GSAP: o header é server component e não pode
 * importar gsap diretamente. Este wrapper leve resolve sem adicionar import
 * de bundle do GSAP no critical path do layout.
 */
export function HeaderBootIn({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ready } = useCinematicReady();
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!ready || animatedRef.current) return;
    animatedRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    // Seleciona os itens animáveis do header
    const targets = container.querySelectorAll<HTMLElement>('[data-boot-item]');
    if (targets.length === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    targets.forEach((el, i) => {
      if (reducedMotion) {
        // Sem animação: só revela imediatamente
        el.style.opacity = '1';
        el.style.transform = '';
        return;
      }

      el.animate(
        [
          { opacity: 0, transform: 'translateY(-18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 480,
          delay: i * 80,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        },
      );
    });
  }, [ready]);

  return <div ref={containerRef} className="contents">{children}</div>;
}
