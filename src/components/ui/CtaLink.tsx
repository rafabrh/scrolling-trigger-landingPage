/**
 * Todo CTA do site é um `<a>` de verdade, com foco visível. Nada de div com
 * onClick: o cinematic não pode ser condição para alcançar uma ação.
 */
export function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http');

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      /*
        Estado :active é essencial em touch: hover nunca dispara no toque, então
        sem :active o tap não dá nenhum retorno tátil. O scale-[0.98] e o
        accent cheio simulam o "pressionar", e transition-all curta faz o
        pressionar/soltar parecer físico tanto no mouse quanto no dedo.
      */
      className="inline-flex items-center gap-3 border border-[var(--accent)] bg-[var(--accent-glow)] px-7 py-[15px] text-[13px] font-medium uppercase tracking-[var(--tracking-snug)] text-[var(--paper)] transition-all duration-150 hover:bg-[var(--accent)] hover:text-[var(--ink-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:scale-[0.98] active:bg-[var(--accent)] active:text-[var(--ink-900)]"
    >
      {children}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        <path d="M2 7h10M8 3l4 4-4 4" />
      </svg>
    </a>
  );
}
