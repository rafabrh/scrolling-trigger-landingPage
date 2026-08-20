import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';
import { CtaLink } from '@/components/ui/CtaLink';

export function ContactSection() {
  const { eyebrow, headline, body, ctaLabel, ctaHref, instagramLabel, instagramHref } =
    SITE_CONTENT.contact;

  return (
    <SectionShell id="contact" eyebrow={eyebrow} headline={headline} support={body}>
      <div className="flex items-center gap-8 max-md:flex-col max-md:items-start max-md:gap-5">
        <CtaLink href={ctaHref}>{ctaLabel}</CtaLink>
        <a
          href={instagramHref}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[13px] tracking-[var(--tracking-snug)] text-[var(--paper-dim)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          {instagramLabel}
        </a>
      </div>
    </SectionShell>
  );
}
