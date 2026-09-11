import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Grade 2x3 com os benefícios de ativar o Agente IA.
 * Cada card usa border-bottom como separador visual.
 */
export function BenefitsSection() {
  const { eyebrow, headline, items } = SITE_CONTENT.benefits;

  return (
    <SectionShell id="benefits" eyebrow={eyebrow} headline={headline}>
      <ul className="grid grid-cols-1 gap-x-16 gap-y-0 lg:grid-cols-2 list-none m-0 p-0">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex flex-col gap-2 py-6"
            style={{ borderBottom: '1px solid var(--surface-border)' }}
          >
            <h3 className="text-[15px] font-semibold text-[var(--paper)]">
              {item.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[var(--paper-dim)]">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
