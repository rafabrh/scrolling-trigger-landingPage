import { SITE_CONTENT } from '@/lib/content/site-content';

export function TechnologySection() {
  const { eyebrow, headline, support, capabilities } = SITE_CONTENT.technology;

  return (
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
      {/* Esquerda: headline ancorada ao fundo */}
      <div className="flex flex-col justify-end gap-6 pb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h2
          className="font-display-upper headline-drift text-[var(--paper)]"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: '0.92' }}
        >
          {headline}
        </h2>
        <p className="max-w-[36ch] text-base leading-relaxed text-[var(--paper-dim)]">
          {support}
        </p>
      </div>

      {/* Direita: lista numerada estilo terminal */}
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--surface-border)' }}>
        {capabilities.map((cap, i) => (
          <div
            key={cap}
            className="flex items-center gap-4 py-[10px]"
            style={{ borderBottom: '1px solid var(--surface-border)' }}
          >
            <span
              className="w-7 shrink-0 font-mono text-[10px]"
              style={{ color: 'var(--accent)', opacity: 0.6 }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[13px] text-[var(--paper-dim)]">{cap}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
