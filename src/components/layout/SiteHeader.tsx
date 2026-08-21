import Image from 'next/image';
import logo from '../../../public/brand/logo.png';
import { SITE_CONTENT } from '@/lib/content/site-content';
import { CtaLink } from '@/components/ui/CtaLink';
import { HeaderBootIn } from './HeaderBootIn';
import { NavScrollSpy } from './NavScrollSpy';

/**
 * Server Component: nenhuma API de browser aqui, então o header já vem no HTML
 * e é indexável sem depender do cinematic ter carregado.
 *
 * Os itens marcados com data-boot-item arrancam com opacity 0 e são animados
 * pelo HeaderBootIn (client component) após o sinal de ready do cinematic.
 * Sem o cinematic (reduced-motion, save-data, mobile sem full-mode), o
 * HeaderBootIn recebe ready=false e os items ficam estáticos — o CSS fallback
 * garante visibilidade (ver globals.css: .no-boot-in).
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.07] bg-[rgba(5,6,7,0.42)] backdrop-blur-md">
      <NavScrollSpy />
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-24 py-[22px] max-md:px-6 max-md:py-4">
        <HeaderBootIn>
          {/* Logo: primeiro item do boot-in */}
          <a
            href="#top"
            data-boot-item
            style={{ opacity: 0 }}
            className="flex items-center gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            {/*
              Import estático: o next/image resolve o logo em build e o serve de
              /_next/static com header immutable. Some a rota dinâmica /_next/image,
              que precisaria do sharp em runtime — um deploy com --prod subiria e
              só falharia na primeira requisição do logo.
            */}
            <Image src={logo} alt="" width={46} height={26} priority className="h-[26px] w-auto" />
            <span className="font-display text-[15px] font-bold tracking-[var(--tracking-wide)]">
              {SITE_CONTENT.brand.name}
            </span>
            <span className="sr-only">Voltar ao topo</span>
          </a>

          {/* Nav desktop: segundo item do boot-in */}
          <nav
            aria-label="Navegação principal"
            data-boot-item
            style={{ opacity: 0 }}
            className="flex items-center gap-10 text-sm max-lg:hidden"
          >
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

          {/*
            Abaixo de lg a navegação some, e sem isto o celular ficava sem
            nenhuma forma de alcançar as seções: não há menu, e o único caminho
            era rolar 500vh de cinematic na mão. `details` resolve sem uma linha
            de JavaScript, operável por teclado por padrão, e mantém o header
            como Server Component.
          */}
          <details
            data-boot-item
            style={{ opacity: 0 }}
            className="relative hidden max-lg:block"
          >
            <summary className="cursor-pointer list-none px-2 py-1 font-mono text-[11px] uppercase tracking-[var(--tracking-wide)] text-[var(--paper-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
              Menu
            </summary>
            <nav
              aria-label="Navegação principal"
              className="absolute right-0 top-full mt-3 flex min-w-[220px] flex-col gap-5 border border-[var(--surface-border)] bg-[rgba(5,8,12,0.94)] p-6 backdrop-blur-md"
            >
              {SITE_CONTENT.nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-[var(--paper-dim)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                >
                  {item.label}
                </a>
              ))}
              <CtaLink href={SITE_CONTENT.cta.href}>{SITE_CONTENT.cta.label}</CtaLink>
            </nav>
          </details>

          {/* CTA desktop: terceiro item do boot-in */}
          <div
            data-boot-item
            style={{ opacity: 0 }}
            className="max-lg:hidden"
          >
            <CtaLink href={SITE_CONTENT.cta.href}>{SITE_CONTENT.cta.label}</CtaLink>
          </div>
        </HeaderBootIn>
      </div>
    </header>
  );
}
