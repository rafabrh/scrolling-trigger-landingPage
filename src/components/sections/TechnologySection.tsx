import { SITE_CONTENT } from '@/lib/content/site-content';
import { SectionShell } from '@/components/ui/SectionShell';

export function TechnologySection() {
  const { eyebrow, headline, support, capabilities } = SITE_CONTENT.technology;

  return (
    <SectionShell id="technology" eyebrow={eyebrow} headline={headline} support={support}>
      {/* Lista numerada estilo terminal */}
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--surface-border)' }}>
        {capabilities.map((cap, i) => (
          <div
            key={cap.label}
            className="flex items-start gap-4 py-[14px]"
            style={{ borderBottom: '1px solid var(--surface-border)' }}
          >
            <span
              className="mt-0.5 w-7 shrink-0 font-mono text-[10px]"
              style={{ color: 'var(--accent)', opacity: 0.6 }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[13px] font-bold text-[var(--paper)]">{cap.label}</span>
              <span className="text-[12px] leading-relaxed text-[var(--paper-dim)]">{cap.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
