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
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="font-display-upper text-2xl text-[var(--paper)]"
                    style={{ letterSpacing: '0.02em' }}
                  >
                    {founder.name}
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                    {founder.role}
                  </p>
                </div>
                {'linkedin' in founder && founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${founder.name}`}
                    className="group flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--surface-border)] bg-transparent transition-all duration-300 hover:scale-110 hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] hover:shadow-[0_0_20px_var(--accent-pulse)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-[var(--paper-dim)] transition-colors duration-300 group-hover:text-[var(--accent)]"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
