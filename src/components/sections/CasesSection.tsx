import { SITE_CONTENT } from '@/lib/content/site-content';

/**
 * Estado vazio intencional — seção reservada para resultados verificáveis.
 * Placeholder blocks com borda tracejada comunicam "reservado" sem inventar case.
 */
export function CasesSection() {
  const { eyebrow, headline, placeholder } = SITE_CONTENT.cases;

  return (
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
      {/* Esquerda: headline */}
      <div className="flex flex-col justify-end gap-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h2
          className="font-display-upper headline-drift text-[var(--paper)]"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: '0.92' }}
        >
          {headline}
        </h2>
        <p
          className="max-w-[44ch] pl-4 text-sm leading-relaxed text-[var(--paper-dim)]"
          style={{ borderLeft: '2px solid var(--surface-border)' }}
        >
          {placeholder}
        </p>
      </div>

      {/* Direita: 3 placeholders tracejados */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex h-[72px] items-center px-5"
            style={{
              border: '1px dashed var(--surface-border)',
              opacity: 0.35,
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--paper-dim)]">
              caso em construção
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
