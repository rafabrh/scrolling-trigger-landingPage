import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

export function AboutSection() {
  const { eyebrow, headline, body, notes } = SITE_CONTENT.about;

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
    </SectionShell>
  );
}
