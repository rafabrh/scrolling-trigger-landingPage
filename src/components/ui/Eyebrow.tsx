export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="h-px w-[30px] bg-[var(--accent)]" aria-hidden="true" />
      <span className="font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--accent)]">
        {children}
      </span>
    </div>
  );
}
