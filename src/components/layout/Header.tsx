'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const NAV = [
  { label: 'Dashboard', href: '/' },
  { label: 'Matches', href: '/matches' },
  { label: 'Tracker', href: '/tracker' },
  { label: 'Settings', href: '/settings' },
];

function useBankroll() {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => {
        const history: { value: number }[] = d.bankrollHistory ?? [];
        if (history.length > 0) setValue(history[history.length - 1].value);
      })
      .catch(() => {});
  }, []);

  return value;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const bankroll = useBankroll();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'G';

  return (
    <>
      <header className="border-b border-white/[0.06] bg-[var(--surface-0)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--edge-green)] to-[var(--edge-cyan)] flex items-center justify-center">
              <span className="font-display text-xs font-bold text-black">GE</span>
            </div>
            <span className="font-display text-base font-bold tracking-tight">GoalEdge</span>
            <span className="badge badge-blue text-[10px] hidden sm:inline-flex">BETA</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
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

          {/* Right: bankroll + user + hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Bankroll (hide on very small screens) */}
            <div className="hidden sm:block text-right">
              <div className="text-xs text-[var(--text-muted)]">Bankroll</div>
              <div className="font-mono text-sm font-bold text-[var(--edge-green)]">
                {bankroll !== null ? `£${bankroll.toFixed(2)}` : '—'}
              </div>
            </div>

            {/* User avatar + dropdown (desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--edge-green)]/30 to-[var(--edge-cyan)]/30 border border-white/10 flex items-center justify-center text-xs font-bold text-[var(--text-primary)] hover:border-white/20 transition-colors"
              >
                {userInitial}
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-10 z-20 w-52 rounded-xl bg-[var(--surface-2)] border border-white/[0.08] shadow-xl py-1 overflow-hidden">
                    {user?.email && (
                      <div className="px-3 py-2.5 border-b border-white/[0.06]">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Signed in as</p>
                        <p className="text-xs font-medium text-[var(--text-secondary)] truncate">{user.email}</p>
                      </div>
                    )}
                    {NAV.map(item => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-white/[0.06] mt-1 pt-1">
                      <button
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 text-sm text-[var(--edge-red)] hover:bg-[var(--edge-red)]/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--surface-1)] border-l border-white/[0.08] flex flex-col animate-slide-up">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--edge-green)] to-[var(--edge-cyan)] flex items-center justify-center">
                  <span className="font-display text-[10px] font-bold text-black">GE</span>
                </div>
                <span className="font-display text-sm font-bold">GoalEdge</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[var(--surface-3)] text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-[var(--edge-green)]" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User section at bottom */}
            <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
              {/* Bankroll pill */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--surface-2)]">
                <span className="text-xs text-[var(--text-muted)]">Bankroll</span>
                <span className="font-mono text-sm font-bold text-[var(--edge-green)]">
                  {bankroll !== null ? `£${bankroll.toFixed(2)}` : '—'}
                </span>
              </div>

              {user && (
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--edge-green)]/30 to-[var(--edge-cyan)]/30 border border-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => { setMobileOpen(false); signOut(); }}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-[var(--edge-red)] bg-[var(--edge-red)]/10 hover:bg-[var(--edge-red)]/15 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
