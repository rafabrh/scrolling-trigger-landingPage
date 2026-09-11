import { GrainOverlay } from './GrainOverlay';

export function PersistentCityBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden bg-[var(--ink-900)]">
      {/* Desktop: frame final do conjunto desktop. Mobile: imagem dedicada menor
          (864×1080 vs 1600×900), economiza ~95KB no carregamento inicial. */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/cinematic/final-city-mobile.webp" />
        <img
          src="/cinematic/desktop/frame-0239.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
        />
      </picture>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(0,212,170,0.12)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,7,0.6)_0%,rgba(5,6,7,0.2)_40%,rgba(5,6,7,0.4)_70%,rgba(5,6,7,0.8)_100%)]" />
      <GrainOverlay />
    </div>
  );
}
