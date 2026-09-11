'use client';

import { useEffect, useState } from 'react';
import { CINEMATIC } from './cinematic.config';
import { FrameCache } from './frame-cache';
import type { FrameSetName } from '@/lib/env/device';

/**
 * Monta o cache do conjunto pedido e devolve quando o primeiro bitmap está
 * pronto para desenhar. `ready` muda poucas vezes na vida da página, então
 * pode ser estado React sem entrar no caminho quente do scroll.
 */
export function useFrameSequence(
  setName: FrameSetName,
  enabled: boolean,
): { cache: FrameCache | null; ready: boolean } {
  const [ready, setReady] = useState(false);
  const [cache, setCache] = useState<FrameCache | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const set = CINEMATIC.frameSets[setName];
    const instance = new FrameCache({
      dir: set.dir,
      frameCount: CINEMATIC.frameCount,
      frameStep: set.frameStep,
      maxDecoded: CINEMATIC.cache.maxDecoded[setName],
      concurrency: CINEMATIC.cache.concurrency[setName],
      tailConcurrency: CINEMATIC.cache.tailConcurrency,
      lookAround: CINEMATIC.cache.lookAround[setName],
      finalFrame: CINEMATIC.finalFrame,
    });

    setCache(instance);
    setReady(false);
    instance.onFirstFrame(() => setReady(true));
    instance.start();

    return () => {
      instance.dispose();
      setCache(null);
      setReady(false);
    };
  }, [setName, enabled]);

  return { cache, ready };
}
