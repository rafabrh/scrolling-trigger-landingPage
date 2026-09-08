import { SITE_CONTENT } from '@/lib/content/site-content';

/**
 * Barra de estatísticas entre o cinematic e as seções institucionais.
 * Três KPIs em linha, separados por borda vertical.
 */
export function HeroStats() {
  const stats = SITE_CONTENT.heroStats;

  return (
    <div className="relative z-10 border-y border-[var(--surface-border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-[1248px] flex-col items-center justify-center gap-8 px-6 py-10 sm:flex-row sm:gap-16 sm:py-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
            <span className="font-display text-[28px] font-bold text-[var(--accent)]">
              {stat.value}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[var(--tracking-wide)] text-[var(--paper-dim)]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
