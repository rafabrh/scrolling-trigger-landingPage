import { afterEach, describe, expect, it, vi } from 'vitest';
import { isPreviewDeploy, shouldIndex } from '@/lib/env/deploy';

// Restaura o ambiente após cada teste para não vazar VERCEL_ENV entre casos.
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('shouldIndex / isPreviewDeploy', () => {
  it("indexa quando VERCEL_ENV === 'production'", () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(shouldIndex()).toBe(true);
    expect(isPreviewDeploy()).toBe(false);
  });

  it("NÃO indexa quando VERCEL_ENV === 'preview'", () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(shouldIndex()).toBe(false);
    expect(isPreviewDeploy()).toBe(true);
  });

  it("NÃO indexa quando VERCEL_ENV === 'development'", () => {
    vi.stubEnv('VERCEL_ENV', 'development');
    expect(shouldIndex()).toBe(false);
    expect(isPreviewDeploy()).toBe(true);
  });

  it('indexa quando VERCEL_ENV está indefinida (default conservador)', () => {
    vi.stubEnv('VERCEL_ENV', undefined as unknown as string);
    expect(shouldIndex()).toBe(true);
    expect(isPreviewDeploy()).toBe(false);
  });
});
