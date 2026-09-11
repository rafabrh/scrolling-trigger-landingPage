import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Dois cards lado a lado: WhatsApp Business e Instagram Comercial.
 * Cada card mostra nome, método (badge), detalhe e meta em mono.
 */
export function IntegrationSection() {
  const { eyebrow, headline, channels } = SITE_CONTENT.integration;

  return (
    <SectionShell id="integration" eyebrow={eyebrow} headline={headline}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {channels.map((channel) => (
          <div
            key={channel.name}
            className="flex flex-col gap-4 border border-[var(--surface-border)] bg-[var(--surface)] p-8"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-[17px] font-semibold text-[var(--paper)]">
                {channel.name}
              </h3>
              <span className="rounded-sm border border-[var(--accent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--accent)]">
                {channel.method}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-[var(--paper-dim)]">
              {channel.detail}
            </p>
            <span className="mt-auto font-mono text-[11px] tracking-[var(--tracking-snug)] text-[var(--accent-muted)]">
              {channel.meta}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
