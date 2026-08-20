import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { CtaLink } from '@/components/ui/CtaLink';
import { whatsappHref } from '@/lib/content/site-content';

/**
 * O 404. Renderiza DENTRO do root layout (herda <html>/<body>, as fontes e o
 * skip link "Skip to content" que aponta para #intro). Por isso o <main>
 * abaixo carrega id="intro": sem ele o skip link do layout cairia no vazio
 * numa rota que não tem a seção institucional da home.
 *
 * `robots: { index: false }` é explícito por clareza — o Next já injeta
 * automaticamente `<meta name="robots" content="noindex">` em respostas 404,
 * mas declarar aqui deixa a intenção óbvia e independe desse comportamento.
 * Não herda `canonical` da home porque, no item 18, movemos o canonical do
 * layout para page.tsx justamente para não vazar para cá.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main
        id="intro"
        className="relative z-10 mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-center px-24 py-32 max-md:px-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--paper-dim)]">
          Error 404
        </p>
        <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] text-[var(--paper)]">
          This page slipped off the map.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[var(--paper-dim)]">
          The link is broken or the page moved. Everything the site has still
          lives on the home page — or start a conversation with us directly.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <a
            href="/"
            className="inline-flex items-center gap-3 border border-[var(--surface-border)] px-7 py-[15px] text-[13px] font-medium uppercase tracking-[var(--tracking-snug)] text-[var(--paper)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Back to home
          </a>
          <CtaLink href={whatsappHref('not-found')}>Talk on WhatsApp</CtaLink>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
