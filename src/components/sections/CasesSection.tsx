import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Estado vazio intencional — seção reservada para resultados verificáveis.
 * Placeholder blocks com borda tracejada comunicam "reservado" sem inventar case.
 */
export function CasesSection() {
  const { eyebrow, headline, placeholder } = SITE_CONTENT.cases;

  return (
    <SectionShell id="cases" eyebrow={eyebrow} headline={headline}>
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Esquerda: nota explicativa */}
        <p
          className="max-w-[44ch] pl-4 text-sm leading-relaxed text-[var(--paper-dim)]"
          style={{ borderLeft: '2px solid var(--surface-border)' }}
        >
          {placeholder}
        </p>

        {/* Direita: 3 placeholders tracejados */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex h-[72px] items-center px-5"
              style={{
                border: '1px dashed var(--surface-border)',
                opacity: 0.55,
              }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--paper-dim)]">
                caso em construção
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
