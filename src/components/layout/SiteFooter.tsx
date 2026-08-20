import { SITE_CONTENT } from '@/lib/content/site-content';

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-[rgba(5,6,7,0.72)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-24 py-10 text-sm text-[var(--paper-dim)] max-md:flex-col max-md:items-start max-md:gap-6 max-md:px-6">
        <span>{SITE_CONTENT.footer.copyright}</span>
        <nav aria-label="Footer" className="flex gap-8">
          {SITE_CONTENT.footer.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
