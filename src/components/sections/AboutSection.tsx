import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

export function AboutSection() {
  const { eyebrow, headline, body, notes, founder } = SITE_CONTENT.about;

  return (
    <SectionShell id="about" eyebrow={eyebrow} headline={headline} support={body}>
      <div className="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
        {notes.map((note) => (
          <div key={note.title} className="border-t border-white/[0.09] pt-7">
            <h3 className="mb-3 font-display text-xl font-medium">{note.title}</h3>
            <p className="text-base leading-[1.62] text-[var(--paper-dim)]">{note.body}</p>
          </div>
        ))}
      </div>

      {/* Crédito do Founder / CTO */}
      <div className="mt-14 flex items-center gap-6 border-t border-white/[0.07] pt-10 max-md:flex-col max-md:items-start max-md:gap-4">
        <div className="flex items-center gap-4">
          {/* Monograma "RA" — identidade visual sem foto */}
          <div
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--accent)] bg-[rgba(64,193,231,0.08)] shadow-[0_0_12px_rgba(64,193,231,0.25)]"
          >
            <span className="font-display text-sm font-bold tracking-widest text-[var(--accent)]">RA</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display text-[var(--text-body-lg)] font-semibold">{founder.name}</span>
            <span className="font-mono text-[11px] uppercase tracking-[var(--tracking-wide)] text-[var(--accent)]">
              {founder.role}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-5 max-md:ml-0">
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn de Rafael Alvarenga"
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[var(--tracking-snug)] text-[var(--paper-dim)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            {/* LinkedIn icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3.6 5.4H1.2V14H3.6V5.4ZM2.4 4.4C3.17 4.4 3.8 3.77 3.8 3 3.8 2.23 3.17 1.6 2.4 1.6 1.63 1.6 1 2.23 1 3 1 3.77 1.63 4.4 2.4 4.4ZM14 14h-2.4V9.8C11.6 8.93 11.57 8 10.5 8 9.43 8 9.2 8.78 9.2 9.75V14H6.8V5.4H9.1V6.5h.04C9.48 5.78 10.3 5.2 11.35 5.2 13.77 5.2 14 6.82 14 8.9V14Z" />
            </svg>
            LinkedIn
          </a>
          <a
            href={founder.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub de Rafael Alvarenga"
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[var(--tracking-snug)] text-[var(--paper-dim)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            {/* GitHub icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 1C4.13 1 1 4.13 1 8c0 3.08 2 5.7 4.78 6.62.35.06.48-.15.48-.33v-1.16c-1.94.42-2.35-.94-2.35-.94-.32-.8-.78-1.02-.78-1.02-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.93-1.55-.18-3.18-.78-3.18-3.46 0-.76.27-1.39.72-1.88-.07-.17-.31-.89.07-1.86 0 0 .59-.19 1.92.72A6.68 6.68 0 0 1 8 4.93c.59 0 1.19.08 1.74.23 1.33-.9 1.91-.72 1.91-.72.38.97.14 1.69.07 1.86.45.49.72 1.12.72 1.88 0 2.69-1.64 3.28-3.2 3.45.25.22.47.64.47 1.3v1.92c0 .18.12.4.48.33A7.002 7.002 0 0 0 15 8c0-3.87-3.13-7-7-7Z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
