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
          {support ? (
            <p className="max-w-[360px] text-base leading-[1.62] text-[var(--paper-dim)]">
              {support}
            </p>
          ) : null}
        </div>

        {children ? <div className="mt-[68px] max-md:mt-12">{children}</div> : null}
      </div>
    </section>
  );
}
