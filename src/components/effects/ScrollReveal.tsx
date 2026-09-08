'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wrapper that reveals children with a stagger animation when scrolled into view.
 * Uses GSAP ScrollTrigger to add the .revealed class once the element enters viewport.
 * Does NOT take an id prop — each section component owns its own id via SectionShell.
 */
export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('revealed'),
      once: true,
    });

    return () => trigger.kill();
  }, []);

  return (
    <div ref={ref} className="scroll-section">
      {children}
    </div>
  );
}
