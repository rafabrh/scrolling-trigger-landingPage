'use client';

import { useEffect, useState } from 'react';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';
import type { CinematicTick } from '@/lib/cinematic/use-cinematic-timeline';
import type { FrameCache } from '@/lib/cinematic/frame-cache';

const SAMPLE_INTERVAL_MS = 200;

interface DebugSnapshot {
  readonly progress: number;
  readonly frame: number;
  readonly scene: string;
  readonly decoded: number;
  readonly encoded: number;
  readonly bytes: number;
  readonly fps: number;
}

/**
 * Lê os refs a 5 Hz em vez de renderizar por frame. O painel existe para
 * calibrar a sequência, e nenhuma calibragem precisa de 60 amostras por
 * segundo. O contador de fps só incrementa dentro do rAF, sem setState.
 */
export function CinematicDebugPanel({
  tickRef,
  cache,
}: {
  tickRef: React.RefObject<CinematicTick>;
  cache: FrameCache | null;
}) {
  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let rafId = 0;

    const count = (): void => {
      frames += 1;
      rafId = window.requestAnimationFrame(count);
    };
    rafId = window.requestAnimationFrame(count);

    const timer = window.setInterval(() => {
      const now = performance.now();
      const fps = (frames * 1000) / (now - last);
      frames = 0;
      last = now;

      const tick = tickRef.current;
      const stats = cache?.stats ?? { decoded: 0, encoded: 0, bytes: 0 };

      setSnapshot({
        progress: tick.progress,
        frame: tick.frame,
        scene: tick.scene,
        decoded: stats.decoded,
        encoded: stats.encoded,
        bytes: stats.bytes,
        fps,
      });
    }, SAMPLE_INTERVAL_MS);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearInterval(timer);
    };
  }, [tickRef, cache]);

  if (!snapshot) return null;

  const rows: ReadonlyArray<readonly [string, string]> = [
    ['Progress', `${(snapshot.progress * 100).toFixed(1)}%`],
    ['Frame', `${snapshot.frame} / ${CINEMATIC.finalFrame}`],
    ['Scene', snapshot.scene],
    ['Decoded', `${snapshot.decoded} / ${CINEMATIC.frameCount}`],
    ['Encoded', `${snapshot.encoded} (${(snapshot.bytes / 1024 / 1024).toFixed(1)} MB)`],
    ['Draw fps', snapshot.fps.toFixed(0)],
  ];

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-50 border border-[var(--surface-border)] bg-[rgba(5,8,12,0.82)] px-4 py-3 font-mono text-[11px] leading-relaxed text-[var(--paper)] backdrop-blur-md">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-3">
          <span className="w-[72px] text-[var(--paper-dim)]">{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
