import { NextResponse } from 'next/server';

const SUBSCRIBE_URL =
  process.env.SHARKNEWS_SUBSCRIBE_URL ||
  process.env.NEXT_PUBLIC_SHARKNEWS_SUBSCRIBE_URL ||
  'https://sharknews-sub.com.br/api/subscribe';

const CAPI_URL =
  process.env.CAPI_WEBHOOK_URL ||
  process.env.NEXT_PUBLIC_CAPI_WEBHOOK_URL ||
  'https://n8n.shkgroups.com/webhook/capi-lead';

const API_KEY = process.env.SHARKNEWS_API_KEY || process.env.NEXT_PUBLIC_SHARKNEWS_API_KEY;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { name?: string; email?: string; page_url?: string; page_title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, page_url, page_title } = body;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const payload = {
    name: name || '',
    first_name: name || '',
    email,
    consentAccepted: true,
    source: 'site_shkgroup',
    page_url: page_url || '',
    page_title: page_title || '',
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['X-Admin-Token'] = API_KEY;

  const res = await fetch(SUBSCRIBE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 502 });
  }

  // CAPI fire-and-forget
  fetch(CAPI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
