import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Slot deliberadamente vazio. Caso, cliente, métrica e depoimento só entram
 * com material verificável. Ver seção 16 da spec.
 *
 * Antes o placeholder era uma única frase solta dentro de uma seção altíssima,
 * o que fazia o vazio parecer build quebrada em vez de escolha. Agora o estado
 * vazio recebe estrutura própria — marcador + label + moldura tracejada — para
 * ler como "reservado de propósito" e ancorar o ritmo vertical da seção.
 */
export function CasesSection() {
  const { eyebrow, headline, placeholder } = SITE_CONTENT.cases;

  return (
    <SectionShell id="cases" eyebrow={eyebrow} headline={headline}>
      {/*
        Moldura tracejada = sinal visual de "espaço reservado". O tracejado e a
        borda em --surface-border comunicam intenção sem inventar case falso.
      */}
      <div className="max-w-[620px] border border-dashed border-[var(--surface-border)] bg-[var(--surface)] px-8 py-10 backdrop-blur-sm max-md:px-6 max-md:py-8">
        <div className="flex items-center gap-3">
          {/* Marcador pulsante discreto: reforça o "em breve" sem prometer data. */}
          <span
            aria-hidden="true"
            className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--accent)]"
          />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--accent)]">
            Reservado
          </span>
        </div>

        <p className="mt-4 max-w-[560px] text-[length:var(--text-body-lg)] leading-[1.62] text-[var(--paper-dim)]">
          {placeholder}
        </p>
      </div>
    </SectionShell>
  );
}
