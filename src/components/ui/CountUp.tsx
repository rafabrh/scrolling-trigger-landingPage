'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Anima um número de 0 até `end` quando o elemento entra no viewport.
 * Aceita decimais (ex: 99.8) e um sufixo opcional (+, %, h, s).
 */
export function CountUp({ end, suffix = '', duration = 1800 }: { end: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function animate() {
    const isDecimal = end % 1 !== 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo for a punchy feel
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = eased * end;

      setDisplay(isDecimal ? current.toFixed(1) : Math.round(current).toString());

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}
