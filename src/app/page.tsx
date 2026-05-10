'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { MatchList } from '@/components/dashboard/MatchList';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { BankrollChart } from '@/components/dashboard/BankrollChart';
import { getBestBet } from '@/lib/decision';
import { BestPicks } from '@/components/dashboard/BestPicks';
import type { MatchAnalysis, UserDashboardStats } from '@/types';

const DEFAULT_STATS: UserDashboardStats = {
  totalBets: 0,
  winRate: 0,
  roi: 0,
  profit: 0,
  disciplineScore: 50,
  bankrollHistory: [{ date: new Date().toISOString().split('T')[0], value: 500 }],
};

const LEAGUES = [
  { label: 'All', value: 'all' },
  { label: 'Premier League', value: 'premier-league' },
  { label: 'La Liga', value: 'la-liga' },
  { label: 'Serie A', value: 'serie-a' },
  { label: 'Bundesliga', value: 'bundesliga' },
  { label: 'Ligue 1', value: 'ligue-1' },
];

type RecoFilter = 'all' | 'bet' | 'small-stake' | 'no-bet';

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-3 w-36 rounded bg-[var(--surface-3)]" />
        <div className="h-5 w-16 rounded-full bg-[var(--surface-3)]" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 rounded bg-[var(--surface-3)]" />
        <div className="h-4 w-8 rounded bg-[var(--surface-3)]" />
        <div className="h-4 w-28 rounded bg-[var(--surface-3)]" />
      </div>
      <div className="rounded-lg bg-[var(--surface-2)] p-3 space-y-2">
        <div className="h-3 w-20 rounded bg-[var(--surface-3)]" />
        <div className="h-2 w-full rounded-full bg-[var(--surface-3)]" />
        <div className="h-3 w-3/4 rounded bg-[var(--surface-3)]" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--surface-3)]" />
    </div>
  );
}

export default function Home() {
  const [analyses, setAnalyses] = useState<MatchAnalysis[]>([]);
  const [stats, setStats] = useState<UserDashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [recoFilter, setRecoFilter] = useState<RecoFilter>('all');
  const [highConf, setHighConf] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/matches').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ])
      .then(([matchData, statsData]) => {
        setAnalyses(matchData.matches ?? []);
        setStats({ ...DEFAULT_STATS, ...statsData });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return analyses.filter(a => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.match.homeTeam.name.toLowerCase().includes(q) &&
          !a.match.awayTeam.name.toLowerCase().includes(q) &&
          !a.match.league.replace(/-/g, ' ').includes(q)
        ) return false;
      }
      if (leagueFilter !== 'all' && a.match.league !== leagueFilter) return false;
      const decision = getBestBet(a);
      if (recoFilter !== 'all' && decision.action !== recoFilter) return false;
      if (highConf && decision.confidence < 70) return false;
      return true;
    });
  }, [analyses, search, leagueFilter, recoFilter, highConf]);

  const hasFilters = search || leagueFilter !== 'all' || recoFilter !== 'all' || highConf;

  const summary = useMemo(() => ({
    bet: analyses.filter(a => getBestBet(a).action === 'bet').length,
    small: analyses.filter(a => getBestBet(a).action === 'small-stake').length,
    noBet: analyses.filter(a => getBestBet(a).action === 'no-bet').length,
  }), [analyses]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Stats row */}
        <DashboardStats stats={stats} />

        {/* Best Picks Today */}
        {!loading && <BestPicks analyses={analyses} />}

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder='Search: "Arsenal", "Premier League", "La Liga today"...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-[var(--surface-2)] border border-white/[0.06] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--edge-green)]/30 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-2">
          {/* League tabs */}
          <div className="flex gap-2 flex-wrap">
            {LEAGUES.map(l => (
              <button
                key={l.value}
                onClick={() => setLeagueFilter(l.value)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  leagueFilter === l.value
                    ? 'bg-[var(--surface-3)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Recommendation + confidence filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-[var(--text-muted)]">Filter:</span>
            {([
              { value: 'all', label: 'All matches', color: '' },
              { value: 'bet', label: '✓ Bet only', color: 'green' },
              { value: 'small-stake', label: '◐ Small stake', color: 'amber' },
              { value: 'no-bet', label: '✗ No bet', color: 'blue' },
            ] as const).map(f => (
              <button
                key={f.value}
                onClick={() => setRecoFilter(f.value as RecoFilter)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  recoFilter === f.value
                    ? f.color === 'green' ? 'bg-[var(--edge-green)]/10 border-[var(--edge-green)]/40 text-[var(--edge-green)]'
                    : f.color === 'amber' ? 'bg-[var(--edge-amber)]/10 border-[var(--edge-amber)]/40 text-[var(--edge-amber)]'
                    : f.color === 'blue' ? 'bg-[var(--edge-blue)]/10 border-[var(--edge-blue)]/40 text-[var(--edge-blue)]'
                    : 'bg-[var(--surface-3)] border-white/10 text-[var(--text-primary)]'
                    : 'border-white/[0.06] text-[var(--text-muted)] hover:border-white/10 hover:text-[var(--text-secondary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => setHighConf(!highConf)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                highConf
                  ? 'bg-[var(--edge-cyan)]/10 border-[var(--edge-cyan)]/40 text-[var(--edge-cyan)]'
                  : 'border-white/[0.06] text-[var(--text-muted)] hover:border-white/10 hover:text-[var(--text-secondary)]'
              }`}
            >
              70%+ confidence
            </button>
          </div>
        </div>

        {/* Results count + clear */}
        {!loading && (
          <div className="flex items-center justify-between -mt-4">
            <p className="text-xs text-[var(--text-muted)]">
              {filtered.length} {filtered.length === 1 ? 'match' : 'matches'}
              {hasFilters ? ' matching filters' : ' upcoming'}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setLeagueFilter('all'); setRecoFilter('all'); setHighConf(false); }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors underline underline-offset-2"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match list */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="card text-center py-12">
                <div className="text-3xl mb-3">⚡</div>
                <p className="font-display text-sm font-bold mb-1">Failed to load matches</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Check your API keys or try again shortly.</p>
                <button
                  onClick={() => { setLoading(true); setError(false); fetch('/api/matches').then(r => r.json()).then(d => setAnalyses(d.matches ?? [])).catch(() => setError(true)).finally(() => setLoading(false)); }}
                  className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-4)] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-3xl mb-3">
                  {search ? '🔍' : recoFilter !== 'all' ? '🎯' : '📭'}
                </div>
                <p className="font-display text-sm font-bold mb-1">
                  {search ? `No results for "${search}"` : recoFilter === 'bet' ? 'No strong bets today' : 'No matches found'}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {recoFilter === 'bet'
                    ? "That's discipline — no edge today means no bet today."
                    : 'Try adjusting your filters or check back later.'}
                </p>
              </div>
            ) : (
              <MatchList analyses={filtered} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BankrollChart data={stats.bankrollHistory} />

            {/* Edge summary */}
            {!loading && !error && (
              <div className="card">
                <h3 className="font-display text-xs font-bold mb-4 text-[var(--text-muted)] uppercase tracking-wider">
                  Today&apos;s Edge Summary
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Strong bets', count: summary.bet, color: 'var(--edge-green)', badge: 'badge-green' },
                    { label: 'Small stake', count: summary.small, color: 'var(--edge-amber)', badge: 'badge-amber' },
                    { label: 'No clear edge', count: summary.noBet, color: 'var(--text-muted)', badge: '' },
                  ].map(({ label, count, color, badge }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                      <span className={badge ? `badge ${badge}` : 'text-sm font-mono text-[var(--text-muted)]'}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-4 pt-3 border-t border-white/[0.04]">
                  Discipline: only bet when there&apos;s a genuine edge.
                </p>
              </div>
            )}

            {/* Discipline score */}
            <div className="card">
              <h3 className="font-display text-sm font-bold mb-3 text-[var(--text-secondary)]">
                Discipline Score
              </h3>
              <div className="flex items-end gap-3">
                <span className="font-display text-4xl font-bold text-[var(--edge-green)]">
                  {stats.disciplineScore}
                </span>
                <span className="text-sm text-[var(--text-muted)] mb-1">/100</span>
              </div>
              <div className="prob-bar mt-3">
                <div
                  className="prob-bar-fill"
                  style={{
                    width: `${stats.disciplineScore}%`,
                    background: stats.disciplineScore > 70
                      ? 'var(--edge-green)'
                      : stats.disciplineScore > 40
                        ? 'var(--edge-amber)'
                        : 'var(--edge-red)',
                  }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Based on stake sizing, advice adherence, and betting frequency.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
