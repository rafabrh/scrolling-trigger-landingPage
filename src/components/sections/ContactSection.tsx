import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';
import { CtaLink } from '@/components/ui/CtaLink';

export function ContactSection() {
  const { eyebrow, headline, body, ctaLabel, ctaHref, instagramLabel, instagramHref } =
    SITE_CONTENT.contact;

  return (
    <SectionShell id="contact" eyebrow={eyebrow} headline={headline}>
      <div className="flex flex-col gap-8">
        <p className="max-w-[44ch] text-base leading-relaxed text-[var(--paper-dim)]">{body}</p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-5">
          <CtaLink href={ctaHref}>{ctaLabel}</CtaLink>
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
          style={{ opacity: 0.55 }}
        >
          {SITE_CONTENT.footer.copyright}
        </p>
      </div>
    </SectionShell>
  );
}
