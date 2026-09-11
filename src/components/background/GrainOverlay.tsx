/**
 * Ruído gerado por feTurbulence num data URI: sem requisição, sem arquivo de
 * textura, sem cache para invalidar. Vai por cima do canvas e por cima da
 * cidade com a mesma intensidade, então a textura é contínua através do
 * handoff e ajuda a costurar os dois.
 *
 * Escondido em mobile (max-md:hidden): o feTurbulence causa rasterização
 * contínua no GPU mobile, custando ~2-4ms por frame de compositing. O efeito
 * é sutil demais numa tela de 6" para justificar o custo.
 */
export const GRAIN_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

const GRAIN_OPACITY = 0.035;

export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-overlay max-md:hidden"
      style={{ opacity: GRAIN_OPACITY, backgroundImage: GRAIN_DATA_URI }}
    />
  );
}
