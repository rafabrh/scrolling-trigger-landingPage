import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';
import { CtaLink } from '@/components/ui/CtaLink';

export function ProductsSection() {
  const { eyebrow, headline, support, items } = SITE_CONTENT.products;

  return (
    <SectionShell id="products" eyebrow={eyebrow} headline={headline} support={support}>
      <div className="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-[30px] border border-[var(--surface-border)] bg-[var(--surface)] p-12 backdrop-blur-lg max-md:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">
                {item.eyebrow}
              </span>
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--paper-dim)]">
                {item.badge}
              </span>
            </div>

            <h3 className="font-display text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] text-pretty max-md:text-[26px]">
              {item.headline}
            </h3>

            <p className="text-base leading-[1.62] text-[var(--paper-dim)]">{item.body}</p>

            <ul className="flex flex-col gap-3.5 border-t border-white/[0.07] pt-6">
              {item.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[15px] text-[var(--paper-dim)]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.4"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path d="M2.5 7.5l3 3 6-7" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-2 self-start">
              <CtaLink href={item.ctaHref}>{item.ctaLabel}</CtaLink>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
