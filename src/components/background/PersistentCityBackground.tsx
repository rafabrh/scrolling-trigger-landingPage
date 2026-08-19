import { CINEMATIC, MOBILE_BREAKPOINT_PX } from '@/lib/cinematic/cinematic.config';
import { GrainOverlay } from './GrainOverlay';

/**
 * A cidade fica fixa atrás do site inteiro, em z-index 0, opacidade 1 desde o
 * primeiro paint. O palco do cinematic cobre ela e some no fim da sequência.
 *
 * `<picture>` em vez de next/image porque isto é art direction, não
 * responsividade de tamanho: o desktop desenha frames 16:9 e o mobile desenha
 * frames 4:5, então o fundo precisa ser o recorte correspondente ou a costura
 * do handoff aparece. O browser baixa um arquivo só, e a escolha acontece sem
 * JavaScript, no servidor.
 *
 * Nenhuma seção institucional usa fundo opaco: o scrim e os gradientes daqui
 * dão o contraste que o texto precisa sem apagar a cidade.
 */
export function PersistentCityBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden bg-[var(--ink-900)]">
      <picture>
        <source
          media={`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`}
          srcSet={CINEMATIC.assets.finalCityMobile}
        />
        <img
          src={CINEMATIC.assets.finalCity}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      <div className="absolute inset-0 bg-[rgba(5,6,7,0.62)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,7,0.5)_0%,rgba(5,6,7,0.1)_40%,rgba(5,6,7,0.62)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_22%_45%,rgba(5,6,7,0.9)_0%,rgba(5,6,7,0.34)_62%,rgba(5,6,7,0.6)_100%)]" />
      <GrainOverlay />
    </div>
  );
}
