'use client';

import { useEffect } from 'react';

/**
 * Scroll-spy via IntersectionObserver.
 *
 * Observa cada seção alvo e, quando ela cobre ≥30% do viewport, aplica
 * `text-[var(--accent)]` ao link de nav correspondente — sem estado React,
 * sem re-render, escrita direta no DOM como o CinematicOverlay faz.
 *
 * SSR-safe: o efeito roda apenas no cliente. Sem window no servidor, sem
 * hydration mismatch.
 */

const SECTION_IDS = ['products', 'technology', 'about', 'contact'];

export function NavScrollSpy() {
  useEffect(() => {
    // Coleta os links de nav que mapeiam para cada seção
    const links = new Map<string, NodeListOf<HTMLAnchorElement>>();
    for (const id of SECTION_IDS) {
      const anchors = document.querySelectorAll<HTMLAnchorElement>(`a[href="#${id}"]`);
      if (anchors.length > 0) links.set(id, anchors);
    }

    const ACTIVE_CLASS = 'text-[var(--accent)]';
    // Tailwind não purga classes dinâmicas — usamos a CSS custom property
    // diretamente via style para evitar o problema sem necessidade de safelist.
    const setActive = (id: string | null) => {
      for (const [sectionId, anchors] of links) {
        const isActive = sectionId === id;
        anchors.forEach((a) => {
          if (isActive) {
            a.style.color = 'var(--accent)';
          } else {
            a.style.color = '';
          }
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Pega a seção mais visível entre as que estão intersectando
        let topEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
              topEntry = entry;
            }
          }
        }
        if (topEntry) {
          setActive((topEntry.target as HTMLElement).id);
        }
      },
      { threshold: 0.3 },
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      setActive(null);
    };
  }, []);

  // Componente invisível — só efeito
  return null;
}
