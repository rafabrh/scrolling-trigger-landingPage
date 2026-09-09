'use client';

import { useEffect, useRef } from 'react';

/**
 * Dispara eventos customizados do Facebook Pixel:
 * - ScrollDepth (25%, 50%, 75%) via IntersectionObserver
 * - ViewContent quando a seção #plans entra no viewport
 * - TimeEngaged a cada 30s de permanência na página
 *
 * Todos os eventos são fire-once (não repetem no mesmo pageview).
 */
export function TrackingEvents() {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fired = firedRef.current;

    function trackOnce(event: string, params: Record<string, unknown>) {
      if (fired.has(event)) return;
      fired.add(event);
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', event, params);
      }
    }

    // --- ScrollDepth (25/50/75%) ---
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = (scrollTop / docHeight) * 100;

      if (pct >= 25) trackOnce('ScrollDepth_25', { percent: 25 });
      if (pct >= 50) trackOnce('ScrollDepth_50', { percent: 50 });
      if (pct >= 75) trackOnce('ScrollDepth_75', { percent: 75 });

      // Desregistra quando todos dispararam
      if (fired.has('ScrollDepth_25') && fired.has('ScrollDepth_50') && fired.has('ScrollDepth_75')) {
        window.removeEventListener('scroll', handleScroll);
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- ViewContent (Plans) ---
    const plansEl = document.getElementById('plans');
    let plansObserver: IntersectionObserver | undefined;
    if (plansEl) {
      plansObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            trackOnce('ViewContent', { content_name: 'Planos', content_category: 'pricing' });
            plansObserver?.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      plansObserver.observe(plansEl);
    }

    // --- TimeEngaged (30s intervals) ---
    let seconds = 0;
    const timer = setInterval(() => {
      seconds += 30;
      trackOnce(`TimeEngaged_${seconds}`, { seconds });
      // Para de trackear depois de 5min
      if (seconds >= 300) clearInterval(timer);
    }, 30_000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      plansObserver?.disconnect();
      clearInterval(timer);
    };
  }, []);

  return null;
}
