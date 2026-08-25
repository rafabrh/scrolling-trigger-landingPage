'use client';

interface SectionDotsProps {
  total: number;
  current: number;
  onDotClick: (i: number) => void;
}

export function SectionDots({ total, current, onDotClick }: SectionDotsProps) {
  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 top-1/2 z-30 -translate-y-1/2 flex flex-col gap-3"
    >
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Section ${i + 1}`}
          onClick={() => onDotClick(i)}
          className="h-2.5 w-2.5 rounded-full transition-all duration-200 ease-in-out"
          style={
            i === current
              ? { background: 'var(--accent)', transform: 'scale(1.25)' }
              : { background: 'var(--tab-inactive)', opacity: 0.5 }
          }
          onMouseEnter={(e) => {
            if (i !== current) (e.currentTarget.style.opacity = '1');
          }}
          onMouseLeave={(e) => {
            if (i !== current) (e.currentTarget.style.opacity = '0.5');
          }}
        />
      ))}
    </nav>
  );
}
