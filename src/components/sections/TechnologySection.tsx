import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

export function TechnologySection() {
  const { eyebrow, headline, support, capabilities } = SITE_CONTENT.technology;

  return (
    <SectionShell id="technology" eyebrow={eyebrow} headline={headline} support={support}>
      <ul className="grid grid-cols-3 gap-x-10 max-lg:grid-cols-2 max-md:grid-cols-1">
        {capabilities.map((capability) => (
          <li
            key={capability}
            className="flex items-start gap-4 border-b border-white/[0.07] py-5 text-[var(--text-body-base)] leading-[1.5] text-[var(--paper-dim)]"
          >
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]" />
            {capability}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
