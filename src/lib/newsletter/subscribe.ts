const SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_SHARKNEWS_SUBSCRIBE_URL ||
  'https://sharknews-sub.com.br/api/subscribe';

const CAPI_URL =
  process.env.NEXT_PUBLIC_CAPI_WEBHOOK_URL ||
  'https://n8n.shkgroups.com/webhook/capi-lead';

export interface SubscribePayload {
  name: string;
  email: string;
}

export async function subscribeNewsletter({ name, email }: SubscribePayload): Promise<void> {
  const body = {
    name,
    first_name: name,
    email,
    consentAccepted: true,
    source: 'site_shkgroup',
    page_url: typeof window !== 'undefined' ? window.location.href : '',
    page_title: typeof document !== 'undefined' ? document.title : '',
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = process.env.NEXT_PUBLIC_SHARKNEWS_API_KEY;
  if (apiKey) headers['X-Admin-Token'] = apiKey;

  const res = await fetch(SUBSCRIBE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Subscribe failed: ${res.status}`);
  }

  // CAPI fire-and-forget — user sees success even if CAPI fails
  fetch(CAPI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((err) => console.warn('[CAPI]', err));
}
