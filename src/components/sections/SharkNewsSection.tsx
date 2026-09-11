'use client';

import { useState, type FormEvent } from 'react';
import { SITE_CONTENT } from '@/lib/content/site-content';
import { subscribeNewsletter } from '@/lib/newsletter/subscribe';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SharkNewsSection() {
  const { eyebrow, headline, support, features, meta, form } =
    SITE_CONTENT.sharknewsSection;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!EMAIL_RE.test(email)) {
      setErrorMsg('Informe um e-mail válido.');
      setStatus('error');
      return;
    }
    if (!consent) {
      setErrorMsg('Aceite a política de privacidade para continuar.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      await subscribeNewsletter({ name, email });
      setStatus('success');
    } catch {
      setErrorMsg(form.errorBody);
      setStatus('error');
    }
  }

  return (
    <section id="sharknews" className="relative z-10 px-24 py-40 max-md:px-6 max-md:py-24">
      <div className="mx-auto max-w-[1248px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3.5">
          <div className="h-px w-[30px] bg-[var(--accent)]" />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--accent)]">
            {eyebrow}
          </span>
        </div>

        {/* Headline */}
        <h2 className="mt-6 font-display text-[var(--text-display-md)] font-semibold leading-[1.06] tracking-[var(--tracking-tight)] text-pretty max-md:text-[32px]">
          {headline}
        </h2>

        {/* Two-column layout: info left, form right */}
        <div className="mt-[68px] grid gap-16 lg:grid-cols-2 max-md:mt-12">
          {/* Left column — copy */}
          <div className="flex flex-col gap-8">
            <p className="max-w-[48ch] text-base leading-relaxed text-[var(--paper-dim)]">
              {support}
            </p>

            {/* Feature list */}
            <ul className="flex flex-col gap-3">
              {features.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-[14px] leading-relaxed text-[var(--paper)]">
                  <span className="mt-1 shrink-0 text-[var(--accent)]" aria-hidden="true">&#9656;</span>
                  {feat}
                </li>
              ))}
            </ul>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-4">
              {meta.map((m) => (
                <div
                  key={m.label}
                  className="border border-[var(--surface-border)] bg-[rgba(5,8,12,0.62)] px-4 py-3 backdrop-blur-sm"
                >
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--accent)]">
                    {m.label}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--paper-dim)]">{m.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — form */}
          <div className="border border-[var(--surface-border)] bg-[rgba(5,8,12,0.62)] p-8 backdrop-blur-sm max-md:p-6">
            {status === 'success' ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="font-mono text-[40px] text-[var(--accent)]" aria-hidden="true">
                  &#10003;
                </div>
                <h3 className="font-display text-[24px] font-semibold text-[var(--paper)]">
                  {form.successTitle}
                </h3>
                <p className="text-[15px] text-[var(--paper-dim)]">{form.successBody}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="sharknews-name"
                    className="font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--paper-dim)]"
                  >
                    Nome
                  </label>
                  <input
                    id="sharknews-name"
                    type="text"
                    placeholder={form.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-[var(--surface-border)] bg-[var(--ink-800)] px-4 py-3 text-[15px] text-[var(--paper)] placeholder:text-[var(--paper-dim)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="sharknews-email"
                    className="font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--paper-dim)]"
                  >
                    E-mail
                  </label>
                  <input
                    id="sharknews-email"
                    type="email"
                    required
                    placeholder={form.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-[var(--surface-border)] bg-[var(--ink-800)] px-4 py-3 text-[15px] text-[var(--paper)] placeholder:text-[var(--paper-dim)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 shrink-0 accent-[var(--accent)]"
                  />
                  <span className="text-[13px] leading-relaxed text-[var(--paper-dim)]">
                    {form.consentText}{' '}
                    <a
                      href={form.consentLink.href}
                      className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--paper)]"
                    >
                      {form.consentLink.label}
                    </a>
                    .
                  </span>
                </label>

                {/* Error */}
                {status === 'error' && errorMsg && (
                  <p className="text-[13px] text-red-400" role="alert" aria-live="assertive">{errorMsg}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-2 border border-[var(--accent)] bg-[var(--accent)] px-6 py-3.5 font-mono text-[13px] font-semibold uppercase tracking-[var(--tracking-snug)] text-[var(--ink-900)] transition-colors hover:bg-transparent hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? form.loadingLabel : form.submitLabel}
                </button>

                {/* Privacy note */}
                <p className="font-mono text-[11px] text-[var(--paper-dim)]" style={{ opacity: 0.6 }}>
                  {form.privacy}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
