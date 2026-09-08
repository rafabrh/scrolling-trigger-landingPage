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

  it('sends POST to subscribe endpoint with correct payload', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await subscribeNewsletter({ name: 'Test', email: 'test@example.com' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://sharknews-sub.com.br/api/subscribe',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: expect.stringContaining('"email":"test@example.com"'),
      }),
    );
  });

  it('includes name as both name and first_name in payload', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await subscribeNewsletter({ name: 'Rafael', email: 'r@test.com' });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const body = JSON.parse(call[1].body);
    expect(body.name).toBe('Rafael');
    expect(body.first_name).toBe('Rafael');
  });

  it('includes source and consentAccepted in payload', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await subscribeNewsletter({ name: '', email: 'r@test.com' });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const body = JSON.parse(call[1].body);
    expect(body.source).toBe('site_shkgroup');
    expect(body.consentAccepted).toBe(true);
  });

  it('fires CAPI webhook as fire-and-forget after subscribe', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await subscribeNewsletter({ name: 'Test', email: 'test@example.com' });

    // fetch called twice: subscribe + CAPI
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://n8n.shkgroups.com/webhook/capi-lead',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws on non-ok response from subscribe endpoint', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });

    await expect(subscribeNewsletter({ name: '', email: 'bad@test.com' }))
      .rejects.toThrow('Subscribe failed: 500');
  });

  it('does not throw if CAPI webhook fails', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true }) // subscribe succeeds
      .mockRejectedValueOnce(new Error('CAPI down')); // CAPI fails

    // Should not throw
    await expect(subscribeNewsletter({ name: '', email: 'test@test.com' }))
      .resolves.toBeUndefined();
  });
});
