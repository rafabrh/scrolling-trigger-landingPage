import Image from 'next/image';
import { SITE_CONTENT } from '@/lib/content/site-content';
import { CtaLink } from '@/components/ui/CtaLink';

/**
 * Server Component: nenhuma API de browser aqui, então o header já vem no HTML
 * e é indexável sem depender do cinematic ter carregado.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.07] bg-[rgba(5,6,7,0.42)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-24 py-[22px] max-md:px-6 max-md:py-4">
        <a
          href="#top"
          className="flex items-center gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <Image
            src="/brand/logo.png"
            alt=""
            width={46}
            height={26}
            priority
            className="h-[26px] w-auto"
          />
          <span className="font-display text-[15px] font-bold tracking-[0.2em]">
            {SITE_CONTENT.brand.name}
          </span>
          <span className="sr-only">Back to top</span>
        </a>

        <nav aria-label="Main" className="flex items-center gap-10 text-sm max-lg:hidden">
          {SITE_CONTENT.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[var(--paper-dim)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="max-md:hidden">
          <CtaLink href={SITE_CONTENT.cta.href}>{SITE_CONTENT.cta.label}</CtaLink>
        </div>
      </div>
    </header>
  );
}
