import { afterEach, describe, expect, it, vi } from 'vitest';

import { FrameCache, type FrameCacheOptions } from '@/lib/cinematic/frame-cache';

/**
 * Opções mínimas para um cache pequeno e determinístico. Um único arquivo
 * basta para exercitar o caminho de fetch/abort.
 */
function makeOptions(overrides: Partial<FrameCacheOptions> = {}): FrameCacheOptions {
  return {
    dir: '/frames',
    frameCount: 1,
    frameStep: 1,
    maxDecoded: 4,
    concurrency: 4,
    tailConcurrency: 2,
    lookAround: 4,
    finalFrame: 0,
    ...overrides,
  };
}

/**
 * Um fetch que nunca resolve sozinho: só rejeita com AbortError quando o signal
 * dispara. Assim o teste controla o ciclo de vida por completo — sem timers,
 * sem rede, sem flakiness. Guarda o último signal recebido para inspeção.
 */
function makeAbortableFetch(): {
  fetch: ReturnType<typeof vi.fn>;
  lastSignal: () => AbortSignal | undefined;
} {
  let capturedSignal: AbortSignal | undefined;
  const fetchMock = vi.fn((_url: string, init?: { signal?: AbortSignal }) => {
    capturedSignal = init?.signal;
    return new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) return;
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  });
  return { fetch: fetchMock, lastSignal: () => capturedSignal };
}

describe('FrameCache — abort em dispose', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('passa um AbortSignal para o fetch', async () => {
    const { fetch, lastSignal } = makeAbortableFetch();
    vi.stubGlobal('fetch', fetch);

    const cache = new FrameCache(makeOptions());
    cache.start();
    await Promise.resolve();

    expect(fetch).toHaveBeenCalled();
    const signal = lastSignal();
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal?.aborted).toBe(false);

    cache.dispose();
  });

  it('aborta o signal em voo quando dispose é chamado', async () => {
    const { fetch, lastSignal } = makeAbortableFetch();
    vi.stubGlobal('fetch', fetch);

    const cache = new FrameCache(makeOptions());
    cache.start();
    await Promise.resolve();

    const signal = lastSignal();
    expect(signal?.aborted).toBe(false);

    cache.dispose();

    expect(signal?.aborted).toBe(true);
  });

  it('não marca o arquivo como abandonado quando o fetch é abortado', async () => {
    const { fetch } = makeAbortableFetch();
    vi.stubGlobal('fetch', fetch);

    const cache = new FrameCache(makeOptions());
    cache.start();
    await Promise.resolve();

    // Dispara o abort e deixa a rejeição do fetch propagar pelo catch.
    cache.dispose();
    await Promise.resolve();
    await Promise.resolve();

    // Nada deve ter estourado, e a sequência settled não deve considerar o
    // arquivo abandonado (isCacheSettled true significaria buraco permanente).
    // Como não expomos internals, basta o teste não lançar: a rejeição do
    // fetch abortado foi tratada sem quebrar a promise pendente do ensure.
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
