export interface SubscribePayload {
  name: string;
  email: string;
}

export async function subscribeNewsletter({ name, email }: SubscribePayload): Promise<void> {
  const res = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
    }),
  });

  if (!res.ok) {
    throw new Error(`Subscribe failed: ${res.status}`);
  }
}
