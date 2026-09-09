import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';
import { CountUp } from '@/components/ui/CountUp';

export function AboutSection() {
  const { eyebrow, headline, body, pillars, metrics, founders } = SITE_CONTENT.about;

  return (
    <SectionShell id="about" eyebrow={eyebrow} headline={headline}>
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Esquerda: body + pillars + metrics */}
        <div className="flex flex-col gap-8">
          <p className="max-w-[48ch] text-base leading-relaxed text-[var(--paper-dim)]">{body}</p>

          {/* Pilares */}
          <div className="flex flex-col" style={{ borderTop: '1px solid var(--surface-border)' }}>
            {pillars.map((pillar) => (
              <div
                key={pillar.index}
                className="flex items-start gap-4 py-5"
                style={{ borderBottom: '1px solid var(--surface-border)' }}
              >
                <span
                  className="mt-0.5 w-7 shrink-0 font-mono text-[10px]"
                  style={{ color: 'var(--accent)', opacity: 0.6 }}
                >
                  {pillar.index}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-semibold text-[var(--paper)]">{pillar.label}</p>
                  <p className="text-sm leading-relaxed text-[var(--paper-dim)]">{pillar.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-8">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-1">
                <span className="font-display-upper text-3xl text-[var(--accent)]">
                  <CountUp end={m.value} suffix={m.suffix} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--paper)]" style={{ opacity: 0.7 }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Direita: cards dos fundadores */}
        <div className="flex flex-col justify-center gap-6">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="p-6"
              style={{ border: '1px solid var(--surface-border)' }}
            >
              {'linkedin' in founder && founder.linkedin ? (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display-upper text-2xl text-[var(--paper)] transition-colors hover:text-[var(--accent)]"
                  style={{ letterSpacing: '0.02em' }}
                >
                  {founder.name}
                </a>
              ) : (
                <p
                  className="font-display-upper text-2xl text-[var(--paper)]"
                  style={{ letterSpacing: '0.02em' }}
                >
                  {founder.name}
                </p>
              )}
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                {founder.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
