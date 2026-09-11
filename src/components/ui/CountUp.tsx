'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Anima um número de 0 até `end` quando o elemento entra no viewport.
 * Aceita decimais (ex: 99.8) e um sufixo opcional (+, %, h, s).
 * Respeita prefers-reduced-motion: mostra o valor final direto.
 */
export function CountUp({ end, suffix = '', duration = 1800 }: { end: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isDecimal = end % 1 !== 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          observer.disconnect();

          if (reducedMotion) {
            setDisplay(isDecimal ? end.toFixed(1) : Math.round(end).toString());
            return;
          }

          const startTime = performance.now();
          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = eased * end;
            setDisplay(isDecimal ? current.toFixed(1) : Math.round(current).toString());
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(tick);
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}
