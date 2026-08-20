import { Eyebrow } from './Eyebrow';

/**
 * Casca comum das seções institucionais. Sem fundo próprio: a cidade fica
 * visível através de todas elas, e o contraste vem dos gradientes do
 * PersistentCityBackground.
 */
export function SectionShell({
  id,
  eyebrow,
  headline,
  support,
  children,
}: {
  id: string;
  eyebrow: string;
  headline: string;
  support?: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="relative z-10 px-24 py-40 max-md:px-6 max-md:py-24">
      <div className="mx-auto max-w-[1248px]">
        <div className="flex items-end justify-between gap-16 max-lg:flex-col max-lg:items-start max-lg:gap-8">
          <div className="flex max-w-[620px] flex-col gap-6">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="font-display text-[52px] font-semibold leading-[1.06] tracking-[-0.024em] text-pretty max-md:text-[32px]">
              {headline}
            </h2>
          </div>

          {/*
            O justify-between empurra este parágrafo para o lado direito do
            viewport, que é justamente onde o scrim horizontal deixa a cidade
            em 49% de luz. Ali o texto media 2,47:1. Aumentar o alfa não
            resolve: em 1.0 ainda dá 3,83:1. Só escurecer o fundo sob ele
            funciona, e um scrim local preserva a cidade em volta.
          */}
          {support ? (
            <p className="max-w-[360px] border-l border-[var(--surface-border)] bg-[rgba(5,8,12,0.62)] px-6 py-5 text-base leading-[1.62] text-[var(--paper-dim)] backdrop-blur-sm">
              {support}
            </p>
          ) : null}
        </div>

        {children ? <div className="mt-[68px] max-md:mt-12">{children}</div> : null}
      </div>
    </section>
  );
}
