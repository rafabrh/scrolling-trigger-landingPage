'use client';

export function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        background: `repeating-linear-gradient(
          to bottom,
          transparent 0px, transparent 3px,
          rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px
        )`,
        animation: 'scanRoll 10s linear infinite',
      }}
    />
  );
}
