import { SITE_CONTENT } from '@/lib/content/site-content';
import { whatsappHref } from '@/lib/content/whatsapp';

export function ProductsSection() {
  const { headline, support, items } = SITE_CONTENT.products;

  return (
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
      {/* Esquerda: hero copy + CTA */}
      <div className="flex flex-col justify-center gap-8">
        <h2
          className="font-display-upper headline-drift text-[var(--paper)]"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 5rem)', lineHeight: '0.92' }}
        >
          {headline}
        </h2>
        <p className="max-w-[42ch] text-base leading-relaxed text-[var(--paper-dim)]">
          {support}
        </p>
        <a
          href={whatsappHref('products')}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex w-fit items-center gap-3 px-7 py-4 text-[13px] font-bold uppercase tracking-[0.14em] transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)', color: 'var(--ink-900)' }}
        >
          Ativar AI Agent →
        </a>
      </div>

      {/* Direita: 6 serviços */}
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--surface-border)' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-1 py-4"
            style={{ borderBottom: '1px solid var(--surface-border)' }}
          >
            <span className="text-[15px] font-semibold text-[var(--paper)]">{item.name}</span>
            <span className="text-sm text-[var(--paper-dim)]">{item.tagline}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
