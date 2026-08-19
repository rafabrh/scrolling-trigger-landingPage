/**
 * Ruído gerado por feTurbulence num data URI: sem requisição, sem arquivo de
 * textura, sem cache para invalidar. Vai por cima do canvas e por cima da
 * cidade com a mesma intensidade, então a textura é contínua através do
 * handoff e ajuda a costurar os dois.
 */
export const GRAIN_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

const DEFAULT_OPACITY = 0.035;

export function GrainOverlay({ opacity = DEFAULT_OPACITY }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{ opacity, backgroundImage: GRAIN_DATA_URI }}
    />
  );
}
