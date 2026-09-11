import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Accordion nativo com <details>/<summary> — zero JS, acessível por padrão.
 * O marker padrão é removido e substituído por um indicador "+" customizado.
 * Inclui JSON-LD FAQPage para rich results nos buscadores.
 */
export function FAQSection() {
  const { eyebrow, headline, items } = SITE_CONTENT.faq;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <SectionShell id="faq" eyebrow={eyebrow} headline={headline}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--surface-border)' }}>
        {items.map((item) => (
          <details
            key={item.question}
            className="group"
            style={{ borderBottom: '1px solid var(--surface-border)' }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-semibold text-[var(--paper)] [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                className="shrink-0 font-mono text-[14px] text-[var(--accent)] transition-transform duration-200 group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="pb-5 pr-12 text-[13px] leading-relaxed text-[var(--paper-dim)]">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
