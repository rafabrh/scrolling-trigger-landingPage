import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Slot deliberadamente vazio. Caso, cliente, métrica e depoimento só entram
 * com material verificável. Ver seção 16 da spec.
 */
export function CasesSection() {
  const { eyebrow, headline, placeholder } = SITE_CONTENT.cases;

  return (
    <SectionShell id="cases" eyebrow={eyebrow} headline={headline}>
      <p className="max-w-[560px] border-l border-[var(--accent-dim)] pl-6 text-base leading-[1.62] text-[var(--paper-dim)]">
        {placeholder}
      </p>
    </SectionShell>
  );
}
