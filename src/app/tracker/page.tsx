'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';

interface Bet {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  league: string;
  market: string;
  stake: number;
  odds: number;
  result: 'pending' | 'won' | 'lost' | 'void';
  profit: number | null;
  placed_at: string;
}

type ResultFilter = 'all' | 'pending' | 'won' | 'lost' | 'void';

const MARKETS = [
  'Home Win', 'Draw', 'Away Win',
  'Over 2.5 Goals', 'Under 2.5 Goals',
  'Both Teams to Score', 'Both Teams Not to Score',
  'Double Chance HX', 'Double Chance XA', 'Double Chance HA',
  'Asian Handicap', 'Correct Score', 'First Goalscorer',
];

const LEAGUES = [
  'premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1',
];

const LEAGUE_LABELS: Record<string, string> = {
  'premier-league': 'Premier League',
  'la-liga': 'La Liga',
  'serie-a': 'Serie A',
  'bundesliga': 'Bundesliga',
  'ligue-1': 'Ligue 1',
};

const RESULT_CONFIG = {
  pending: { cls: 'badge-blue', label: 'PENDING', dot: 'bg-[var(--edge-blue)]' },
  won:     { cls: 'badge-green', label: 'WON', dot: 'bg-[var(--edge-green)]' },
  lost:    { cls: 'badge-red', label: 'LOST', dot: 'bg-[var(--edge-red)]' },
  void:    { cls: 'badge-purple', label: 'VOID', dot: 'bg-[var(--edge-purple)]' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="card relative overflow-hidden">
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[var(--radius-lg)]" style={{ background: accent }} />
      )}
      <div className="label-xs mb-2">{label}</div>
      <div className="font-display text-2xl font-bold leading-none" style={{ color: accent || 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-[var(--text-muted)] mt-1.5">{sub}</div>}
    </div>
  );
}

interface LogBetFormProps {
  onClose: () => void;
  onSaved: () => void;
}

function LogBetForm({ onClose, onSaved }: LogBetFormProps) {
  const [form, setForm] = useState({
    homeTeam: '', awayTeam: '', league: 'premier-league',
    market: 'Home Win', stake: '', odds: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const potentialProfit = form.stake && form.odds
    ? ((parseFloat(form.stake) * parseFloat(form.odds)) - parseFloat(form.stake)).toFixed(2)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.homeTeam || !form.awayTeam || !form.stake || !form.odds) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: `manual-${Date.now()}`,
          homeTeam: form.homeTeam,
          awayTeam: form.awayTeam,
          league: form.league,
          market: form.market,
          stake: parseFloat(form.stake),
          odds: parseFloat(form.odds),
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      onSaved();
      onClose();
    } catch {
      setError('Failed to save bet. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card animate-slide-up border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-base font-bold">Log a Bet</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Record a new bet in your tracker</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Teams */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs block mb-1.5">Home Team *</label>
              <input
                className="input"
                placeholder="e.g. Arsenal"
                value={form.homeTeam}
                onChange={e => setForm(f => ({ ...f, homeTeam: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Away Team *</label>
              <input
                className="input"
                placeholder="e.g. Chelsea"
                value={form.awayTeam}
                onChange={e => setForm(f => ({ ...f, awayTeam: e.target.value }))}
              />
            </div>
          </div>

          {/* League */}
          <div>
            <label className="label-xs block mb-1.5">League</label>
            <select
              className="input"
              value={form.league}
              onChange={e => setForm(f => ({ ...f, league: e.target.value }))}
            >
              {LEAGUES.map(l => (
                <option key={l} value={l}>{LEAGUE_LABELS[l]}</option>
              ))}
            </select>
          </div>

          {/* Market */}
          <div>
            <label className="label-xs block mb-1.5">Market *</label>
            <select
              className="input"
              value={form.market}
              onChange={e => setForm(f => ({ ...f, market: e.target.value }))}
            >
              {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Stake + Odds */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs block mb-1.5">Stake (£) *</label>
              <input
                className="input font-mono"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="10.00"
                value={form.stake}
                onChange={e => setForm(f => ({ ...f, stake: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Odds (decimal) *</label>
              <input
                className="input font-mono"
                type="number"
                step="0.01"
                min="1.01"
                placeholder="2.10"
                value={form.odds}
                onChange={e => setForm(f => ({ ...f, odds: e.target.value }))}
              />
            </div>
          </div>

          {/* Potential profit preview */}
          {potentialProfit && (
            <div className="rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">Potential profit</span>
              <span className="font-mono font-bold text-[var(--edge-green)]">+£{potentialProfit}</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-[var(--edge-red)]">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--surface-3)] text-[var(--text-secondary)] hover:bg-[var(--surface-4)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[var(--edge-green)] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Log Bet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface BetCardProps {
  bet: Bet;
  onSettle: (id: string, result: 'won' | 'lost' | 'void') => Promise<void>;
  settling: string | null;
}

function BetCard({ bet, onSettle, settling }: BetCardProps) {
  const cfg = RESULT_CONFIG[bet.result];
  const potentialProfit = ((bet.stake * bet.odds) - bet.stake).toFixed(2);
  const isPending = bet.result === 'pending';
  const isSettling = settling === bet.id;

  return (
    <div className={`card transition-all ${isPending ? 'edge-glow' : ''}`}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-display text-sm font-bold truncate">
              {bet.home_team} <span className="text-[var(--text-muted)] font-normal">vs</span> {bet.away_team}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {LEAGUE_LABELS[bet.league] ?? bet.league.replace(/-/g, ' ')}
            </span>
            <span className="text-[var(--text-muted)] text-[10px]">·</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">{formatDate(bet.placed_at)}</span>
          </div>
        </div>
        <span className={`badge ${cfg.cls} ml-3 shrink-0`}>{cfg.label}</span>
      </div>

      {/* Market + numbers */}
      <div className="rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)] px-3 py-2.5 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-0.5">Market</p>
            <p className="text-sm font-bold text-[var(--edge-cyan)]">{bet.market}</p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-0.5">Stake</p>
              <p className="font-mono text-sm font-bold">£{bet.stake.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-0.5">Odds</p>
              <p className="font-mono text-sm font-bold">{bet.odds.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-0.5">
                {bet.result === 'pending' ? 'To win' : 'P&L'}
              </p>
              <p className={`font-mono text-sm font-bold ${
                bet.result === 'won' ? 'text-[var(--edge-green)]' :
                bet.result === 'lost' ? 'text-[var(--edge-red)]' :
                'text-[var(--text-secondary)]'
              }`}>
                {bet.result === 'pending'
                  ? `+£${potentialProfit}`
                  : bet.result === 'won'
                    ? `+£${(bet.profit ?? 0).toFixed(2)}`
                    : bet.result === 'lost'
                      ? `-£${bet.stake.toFixed(2)}`
                      : '—'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settle buttons for pending bets */}
      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={() => onSettle(bet.id, 'won')}
            disabled={isSettling}
            className="flex-1 py-2 rounded-lg text-xs font-bold bg-[var(--edge-green)]/10 text-[var(--edge-green)] border border-[var(--edge-green)]/25 hover:bg-[var(--edge-green)]/20 transition-colors disabled:opacity-40"
          >
            {isSettling ? '…' : '✓ Won'}
          </button>
          <button
            onClick={() => onSettle(bet.id, 'lost')}
            disabled={isSettling}
            className="flex-1 py-2 rounded-lg text-xs font-bold bg-[var(--edge-red)]/10 text-[var(--edge-red)] border border-[var(--edge-red)]/25 hover:bg-[var(--edge-red)]/20 transition-colors disabled:opacity-40"
          >
            {isSettling ? '…' : '✗ Lost'}
          </button>
          <button
            onClick={() => onSettle(bet.id, 'void')}
            disabled={isSettling}
            className="py-2 px-3 rounded-lg text-xs font-bold bg-[var(--surface-3)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-40"
          >
            Void
          </button>
        </div>
      )}
    </div>
  );
}

export default function TrackerPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<ResultFilter>('all');
  const [settling, setSettling] = useState<string | null>(null);

  async function loadBets() {
    try {
      const res = await fetch('/api/bets');
      const data = await res.json();
      setBets(data.bets ?? []);
    } catch {
      setBets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBets(); }, []);

  async function handleSettle(id: string, result: 'won' | 'lost' | 'void') {
    setSettling(id);
    try {
      await fetch(`/api/bets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
      await loadBets();
    } finally {
      setSettling(null);
    }
  }

  const settled = bets.filter(b => b.result !== 'pending');
  const won = bets.filter(b => b.result === 'won');
  const lost = bets.filter(b => b.result === 'lost');
  const pending = bets.filter(b => b.result === 'pending');
  const netProfit = settled.reduce((sum, b) => {
    if (b.result === 'won') return sum + (b.profit ?? 0);
    if (b.result === 'lost') return sum - b.stake;
    return sum;
  }, 0);
  const totalStaked = settled.reduce((sum, b) => sum + b.stake, 0);
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const winRate = settled.length > 0 ? (won.length / settled.length) * 100 : 0;

  const filtered = useMemo(() =>
    filter === 'all' ? bets : bets.filter(b => b.result === filter),
    [bets, filter]
  );

  const FILTERS: { value: ResultFilter; label: string }[] = [
    { value: 'all', label: `All (${bets.length})` },
    { value: 'pending', label: `Pending (${pending.length})` },
    { value: 'won', label: `Won (${won.length})` },
    { value: 'lost', label: `Lost (${lost.length})` },
    { value: 'void', label: `Void (${bets.filter(b => b.result === 'void').length})` },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Bet Tracker</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">Record, settle, and review all your bets</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[var(--edge-green)] text-black hover:opacity-90 transition-opacity"
          >
            <span className="text-base leading-none">+</span>
            Log Bet
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            sub={`${won.length}W · ${lost.length}L`}
            accent={winRate >= 50 ? 'var(--edge-green)' : winRate > 0 ? 'var(--edge-amber)' : 'var(--surface-5)'}
          />
          <StatCard
            label="Net Profit"
            value={`${netProfit >= 0 ? '+' : ''}£${Math.abs(netProfit).toFixed(2)}`}
            sub={netProfit >= 0 ? 'in profit' : 'in loss'}
            accent={netProfit > 0 ? 'var(--edge-green)' : netProfit < 0 ? 'var(--edge-red)' : 'var(--surface-5)'}
          />
          <StatCard
            label="ROI"
            value={`${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`}
            sub="on settled bets"
            accent={roi > 0 ? 'var(--edge-green)' : roi < 0 ? 'var(--edge-red)' : 'var(--surface-5)'}
          />
          <StatCard
            label="Pending"
            value={String(pending.length)}
            sub={pending.length === 1 ? 'bet open' : 'bets open'}
            accent={pending.length > 0 ? 'var(--edge-blue)' : 'var(--surface-5)'}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-[var(--surface-3)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bet list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 w-48 rounded bg-[var(--surface-3)]" />
                  <div className="h-5 w-16 rounded-full bg-[var(--surface-3)]" />
                </div>
                <div className="h-16 w-full rounded-lg bg-[var(--surface-2)]" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-14 border-dashed">
            <div className="text-3xl mb-3">{bets.length === 0 ? '📋' : '🔍'}</div>
            <p className="font-display text-sm font-bold mb-1">
              {bets.length === 0 ? 'No bets logged yet' : `No ${filter} bets`}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
              {bets.length === 0
                ? 'Start tracking your bets to see performance stats.'
                : 'Try a different filter.'}
            </p>
            {bets.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--edge-green)] text-black hover:opacity-90 transition-opacity"
              >
                Log your first bet
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bet, i) => (
              <div key={bet.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <BetCard bet={bet} onSettle={handleSettle} settling={settling} />
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <LogBetForm
          onClose={() => setShowForm(false)}
          onSaved={loadBets}
        />
      )}
    </div>
  );
}
