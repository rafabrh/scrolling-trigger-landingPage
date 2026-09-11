import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { subscribeNewsletter } from '../src/lib/newsletter/subscribe';

describe('subscribeNewsletter', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends POST to /api/newsletter with name and email', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await subscribeNewsletter({ name: 'Test', email: 'test@example.com' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/newsletter',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: expect.stringContaining('"email":"test@example.com"'),
      }),
    );
  });

  it('includes name in the payload sent to the API route', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await subscribeNewsletter({ name: 'Rafael', email: 'r@test.com' });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const body = JSON.parse(call[1].body);
    expect(body.name).toBe('Rafael');
    expect(body.email).toBe('r@test.com');
  });

  it('throws on non-ok response', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });

    await expect(subscribeNewsletter({ name: '', email: 'bad@test.com' }))
      .rejects.toThrow('Subscribe failed: 500');
  });

  it('only calls fetch once (API route handles CAPI internally)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await subscribeNewsletter({ name: 'Test', email: 'test@example.com' });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
