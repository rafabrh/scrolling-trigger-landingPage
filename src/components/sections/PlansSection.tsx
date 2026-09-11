import { PLANS, PLANS_FOOTER } from '@/lib/content/plans-content';
import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

export function PlansSection() {
  const { eyebrow, headline } = SITE_CONTENT.plans;

  return (
    <SectionShell id="plans" eyebrow={eyebrow} headline={headline}>
      {/* 3 cards side-by-side */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const badge = 'badge' in plan ? (plan.badge as string) : undefined;
          const vagas = 'vagas' in plan ? (plan.vagas as string) : undefined;
          const bonuses = 'bonuses' in plan ? (plan.bonuses as readonly string[]) : undefined;

          return (
            <div
              key={plan.id}
              className="flex flex-col gap-6 p-6"
              style={{ border: '1px solid var(--surface-border)' }}
            >
              {/* Header: nome + badge + vagas */}
              <div className="flex flex-col gap-2">
                <span
                  className="font-display-upper text-3xl"
                  style={{ color: plan.accent }}
                >
                  {plan.name}
                </span>
                {badge && (
                  <span
                    className="w-fit px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
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
                    className="font-mono text-[10px] uppercase tracking-[0.1em]"
                    style={{ color: 'var(--obsidian-accent)' }}
                  >
                    {vagas}
                  </span>
                )}
              </div>

              {/* Tagline */}
              <p className="text-sm leading-relaxed text-[var(--paper-dim)]">{plan.tagline}</p>

              {/* Price + subtag */}
              <div className="flex flex-col gap-1">
                <div>
                  <span className="text-[28px] font-bold text-[var(--paper)]">{plan.price}</span>
                  <span className="ml-1 font-mono text-[11px] text-[var(--paper-dim)]">{plan.period}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--accent-muted)]">
                  {plan.subtag}
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-1 flex-col gap-[7px] list-none m-0 p-0" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-[11px] text-[var(--paper-dim)]">
                    <span
                      className="mt-[6px] inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--accent)]"
                      style={{ opacity: 0.5 }}
                    />
                    {feat}
                  </li>
                ))}
              </ul>

              {/* Bonuses */}
              {bonuses && bonuses.length > 0 && (
                <div
                  className="flex flex-col gap-2 p-4"
                  style={{ background: 'var(--accent-glow)', border: '1px solid var(--surface-border)' }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">
                    Bônus inclusos
                  </span>
                  <ul className="flex flex-col gap-1 list-none m-0 p-0">
                    {bonuses.map((bonus) => (
                      <li key={bonus} className="text-[11px] leading-relaxed text-[var(--paper-dim)]">
                        {bonus}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <a
                href={plan.cta.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Ativar plano ${plan.name}`}
                className="mt-auto inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                style={{ background: plan.accent, color: 'var(--ink-900)' }}
              >
                {plan.cta.label}
              </a>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p
        className="mt-8 text-center font-mono text-[11px] text-[var(--paper-muted)]"
      >
        {PLANS_FOOTER}
      </p>
    </SectionShell>
  );
}
