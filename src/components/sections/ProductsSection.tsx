import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';
import { CtaLink } from '@/components/ui/CtaLink';
import { whatsappHref } from '@/lib/content/whatsapp';

export function ProductsSection() {
  const { eyebrow, headline, support, items } = SITE_CONTENT.products;

  return (
    <SectionShell id="products" eyebrow={eyebrow} headline={headline} support={support}>
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Esquerda: lista de serviços */}
        <div className="flex flex-col" style={{ borderTop: '1px solid var(--surface-border)' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 py-4"
              style={{ borderBottom: '1px solid var(--surface-border)' }}
            >
              {'href' in item && item.href ? (
                <a
                  href={item.href}
                  className="text-[15px] font-semibold text-[var(--paper)] transition-colors hover:text-[var(--accent)]"
                >
                  {item.name}
                </a>
              ) : (
                <span className="text-[15px] font-semibold text-[var(--paper)]">{item.name}</span>
              )}
              <span className="text-sm text-[var(--paper-dim)]">{item.tagline}</span>
              <span className="mt-1 text-[13px] leading-relaxed text-[var(--paper-dim)]" style={{ opacity: 0.75 }}>
                {item.description}
              </span>
            </div>
          ))}
        </div>

        {/* Direita: CTA */}
        <div className="flex flex-col justify-center gap-8">
          <CtaLink href={whatsappHref('products')}>Ativar AI Agent</CtaLink>
        </div>
      </div>
    </SectionShell>
  );
}
