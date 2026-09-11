'use client';

import { useEffect, useRef } from 'react';

/**
 * Wrapper that reveals children with a stagger animation when scrolled into view.
 * Uses IntersectionObserver (native, zero library) to add the .revealed class once.
 * The actual animation is pure CSS in globals.css (.scroll-section / .revealed).
 */
export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add('revealed');
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '-15% 0px' },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="scroll-section">
      {children}
    </div>
  );
}
