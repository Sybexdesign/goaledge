'use client';

export function Header() {
  return (
    <header className="border-b border-white/[0.06] bg-[var(--surface-0)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--edge-green)] to-[var(--edge-cyan)] flex items-center justify-center">
            <span className="font-display text-xs font-bold text-black">GE</span>
          </div>
          <span className="font-display text-base font-bold tracking-tight">
            GoalEdge
          </span>
          <span className="badge badge-blue text-[10px] ml-1">BETA</span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Dashboard', active: true },
            { label: 'Matches', active: false },
            { label: 'Tracker', active: false },
            { label: 'Settings', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`text-sm font-medium transition-colors ${
                item.active
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bankroll display */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs text-[var(--text-muted)]">Bankroll</div>
            <div className="font-mono text-sm font-bold text-[var(--edge-green)]">£541.20</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-xs font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
