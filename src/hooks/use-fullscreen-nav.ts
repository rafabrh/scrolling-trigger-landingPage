'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/** Pure navigation state machine, testable without React. */
export function createNavState(total: number) {
  let idx = 0;
  return {
    index: () => idx,
    next: () => { idx = Math.min(idx + 1, total - 1); },
    prev: () => { idx = Math.max(idx - 1, 0); },
    goTo: (i: number) => { idx = Math.max(0, Math.min(i, total - 1)); },
  };
}

const LOCK_MS = 800;
const TOUCH_THRESHOLD = 50;

export function useFullscreenNav(total: number) {
  const [index, setIndex] = useState(0);
  const lock = useRef(false);

  const next = useCallback(() => {
    if (lock.current) return;
    setIndex((i) => Math.min(i + 1, total - 1));
    lock.current = true;
    setTimeout(() => { lock.current = false; }, LOCK_MS);
  }, [total]);

  const prev = useCallback(() => {
    if (lock.current) return;
    setIndex((i) => Math.max(i - 1, 0));
    lock.current = true;
    setTimeout(() => { lock.current = false; }, LOCK_MS);
  }, [total]);

  const goTo = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(i, total - 1)));
  }, [total]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) next(); else prev();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > TOUCH_THRESHOLD) {
        if (diff > 0) next(); else prev();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [next, prev]);

  return { index, next, prev, goTo };
}
