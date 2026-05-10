'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Dashboard', href: '/' },
  { label: 'Matches', href: '/matches' },
  { label: 'Tracker', href: '/tracker' },
  { label: 'Settings', href: '/settings' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/[0.06] bg-[var(--surface-0)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--edge-green)] to-[var(--edge-cyan)] flex items-center justify-center">
            <span className="font-display text-xs font-bold text-black">GE</span>
          </div>
          <span className="font-display text-base font-bold tracking-tight">GoalEdge</span>
          <span className="badge badge-blue text-[10px] ml-1">BETA</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--surface-2)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)]/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bankroll + avatar */}
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
