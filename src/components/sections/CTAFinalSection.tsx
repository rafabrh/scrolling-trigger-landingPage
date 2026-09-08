import { SITE_CONTENT } from '@/lib/content/site-content';
import { CtaLink } from '@/components/ui/CtaLink';

/**
 * Seção de urgência final. Não usa SectionShell (sem eyebrow), mas mantém
 * o mesmo padding e max-width para consistência visual.
 */
export function CTAFinalSection() {
  const { headline, body, ctas } = SITE_CONTENT.ctaFinal;

  return (
    <section id="cta-final" className="relative z-10 px-24 py-40 max-md:px-6 max-md:py-24">
      <div className="mx-auto flex max-w-[1248px] flex-col items-center gap-10 text-center">
        <h2 className="font-display-upper max-w-[720px] text-[var(--text-display-md)] leading-[1.06] tracking-[var(--tracking-tight)] text-[var(--paper)] max-md:text-[32px]">
          {headline}
        </h2>
        <p className="max-w-[56ch] text-base leading-relaxed text-[var(--paper-dim)]">
          {body}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          {ctas.map((cta) => (
            <CtaLink key={cta.label} href={cta.href}>
              {cta.label}
            </CtaLink>
          ))}
        </div>
      </div>
    </section>
  );
}
