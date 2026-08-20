export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="h-px w-[30px] bg-[var(--accent)]" />
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
        {children}
      </span>
    </div>
  );
}
