import { SITE_CONTENT } from '@/lib/content/site-content';
import { Eyebrow } from '@/components/ui/Eyebrow';

export function InstitutionalIntro() {
  const { eyebrow, headline, body, pillars, meta } = SITE_CONTENT.intro;

  return (
    <section id="intro" className="relative z-10 px-24 py-40 max-md:px-6 max-md:py-24">
      <div className="mx-auto flex max-w-[1248px] flex-col gap-9">
        <Eyebrow>{eyebrow}</Eyebrow>

        <h2 className="max-w-[700px] font-display text-[58px] font-semibold leading-[1.06] tracking-[-0.024em] text-pretty max-md:text-[34px]">
          {headline}
        </h2>

        <p className="max-w-[520px] text-lg leading-[1.62] text-[var(--paper-dim)]">{body}</p>

        <ul className="mt-3.5 grid grid-cols-3 border-t border-white/[0.09] max-md:grid-cols-1">
          {pillars.map((pillar) => (
            <li
              key={pillar.index}
              className="border-r border-white/[0.09] py-7 pr-8 last:border-r-0 max-md:border-b max-md:border-r-0 max-md:pr-0"
            >
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                {pillar.index}
              </div>
              <div className="font-display text-[17px] font-medium">{pillar.label}</div>
            </li>
          ))}
        </ul>

        <p className="self-end font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--paper-dim)] max-md:self-start">
          {meta}
        </p>
      </div>
    </section>
  );
}
