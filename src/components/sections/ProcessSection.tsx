import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Quatro passos do processo de ativação, listados verticalmente.
 * Número em accent, título em paper, descrição em paper-dim.
 */
export function ProcessSection() {
  const { eyebrow, headline, steps } = SITE_CONTENT.process;

  return (
    <SectionShell id="process" eyebrow={eyebrow} headline={headline}>
      <ol className="flex flex-col list-none m-0 p-0" style={{ borderTop: '1px solid var(--surface-border)' }}>
        {steps.map((step) => (
          <li
            key={step.number}
            className="flex items-start gap-6 py-6"
            style={{ borderBottom: '1px solid var(--surface-border)' }}
          >
            <span className="mt-0.5 shrink-0 font-display text-[28px] font-bold leading-none text-[var(--accent)]">
              {step.number}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-[15px] font-semibold text-[var(--paper)]">
                {step.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-[var(--paper-dim)]">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
