import { SITE_CONTENT } from '@/lib/content/site-content';

export function AboutSection() {
  // 'founders' (plural) — array com Rafael + Victor
  const { eyebrow, headline, body, notes, founders } = SITE_CONTENT.about;

  return (
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
      {/* Esquerda: headline + pilares */}
      <div className="flex flex-col gap-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h2
          className="font-display-upper headline-drift text-[var(--paper)]"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: '0.92' }}
        >
          {headline}
        </h2>
        <p className="max-w-[42ch] text-base leading-relaxed text-[var(--paper-dim)]">{body}</p>
        <div className="flex flex-col" style={{ borderTop: '1px solid var(--surface-border)' }}>
          {notes.map((note) => (
            <div
              key={note.title}
              className="py-5"
              style={{ borderBottom: '1px solid var(--surface-border)' }}
            >
              <p className="mb-1 text-[14px] font-semibold text-[var(--paper)]">{note.title}</p>
              <p className="text-sm leading-relaxed text-[var(--paper-dim)]">{note.body}</p>
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
        ))}
      </div>
    </div>
  );
}
