import { PLANS } from '@/lib/content/plans-content';
import { SITE_CONTENT } from '@/lib/content/site-content';

export function PlansSection() {
  const { eyebrow, headline } = SITE_CONTENT.plans;

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="mb-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h2
          className="font-display-upper headline-drift mt-2 text-[var(--paper)]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', lineHeight: '1' }}
        >
          {headline}
        </h2>
      </div>

      {/* Tier rows */}
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--surface-border)' }}>
        {PLANS.map((plan) => {
          // Propriedades opcionais — presentes apenas em pro e obsidian
          const badge = ('badge' in plan ? plan.badge : undefined) as string | undefined;
          const vagas = ('vagas' in plan ? plan.vagas : undefined) as string | undefined;

          return (
            <div
              key={plan.id}
              className="grid items-center gap-0 py-4"
              style={{
                gridTemplateColumns: '200px 1fr 180px',
                borderBottom: '1px solid var(--surface-border)',
              }}
            >
              {/* Nome do plano */}
              <div
                className="flex flex-col pr-8"
                style={{ borderRight: '1px solid var(--surface-border)' }}
              >
                <span
                  className="font-display-upper"
                  style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', color: plan.accent }}
                >
                  {plan.name}
                </span>
                {badge && (
                  <span
                    className="mt-2 w-fit px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em]"
                    style={{
                      background: plan.id === 'pro' ? 'var(--pro-accent)' : 'var(--obsidian-accent)',
                      color: plan.id === 'pro' ? '#0a0714' : '#0a0700',
                    }}
                  >
                    {badge}
                  </span>
                )}
                {vagas && (
                  <span
                    className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em]"
                    style={{ color: 'var(--obsidian-accent)', opacity: 0.7 }}
                  >
                    {vagas}
                  </span>
                )}
              </div>

              {/* Features */}
              <div
                className="flex flex-col gap-[7px] px-8"
                style={{ borderRight: '1px solid var(--surface-border)' }}
              >
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-[11px] text-[var(--paper-dim)]">
                    <span
                      className="inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--accent)]"
                      style={{ opacity: 0.5 }}
                    />
                    {feat}
                  </div>
                ))}
              </div>

              {/* Preço + CTA */}
              <div className="flex flex-col gap-3 pl-8">
                <div>
                  <span className="block text-[22px] font-bold text-[var(--paper)]">
                    {plan.price}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--paper-dim)]">{plan.period}</span>
                </div>
                <a
                  href={plan.cta.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex w-fit items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
                  style={{ background: plan.accent, color: 'var(--ink-900)' }}
                >
                  {plan.cta.label} →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
