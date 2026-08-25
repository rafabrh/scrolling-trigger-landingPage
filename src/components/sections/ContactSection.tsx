import { SITE_CONTENT } from '@/lib/content/site-content';

export function ContactSection() {
  const { eyebrow, headline, body, ctaLabel, ctaHref, instagramLabel, instagramHref } =
    SITE_CONTENT.contact;

  return (
    <div className="flex flex-col gap-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">
        {eyebrow}
      </p>

      {/* Mega headline */}
      <h2
        className="font-display-upper headline-drift max-w-[16ch] text-[var(--paper)]"
        style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: '0.92' }}
      >
        {headline}
      </h2>

      <p className="max-w-[44ch] text-base leading-relaxed text-[var(--paper-dim)]">{body}</p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-5">
        <a
          href={ctaHref}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-3 px-8 py-5 text-[13px] font-bold uppercase tracking-[0.14em] transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)', color: 'var(--ink-900)' }}
        >
          {ctaLabel} →
        </a>
        <a
          href={instagramHref}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[13px] tracking-[0.14em] text-[var(--paper-dim)] transition-colors hover:text-[var(--accent)]"
        >
          {instagramLabel}
        </a>
      </div>

      {/* Copyright */}
      <p
        className="mt-8 font-mono text-[11px] text-[var(--paper-dim)]"
        style={{ opacity: 0.4 }}
      >
        {SITE_CONTENT.footer.copyright}
      </p>
    </div>
  );
}
