'use client';

import Link from 'next/link';
import type { MatchAnalysis } from '@/types';
import { FormDisplay } from '@/components/match/FormDisplay';
import { getBestBet } from '@/lib/decision';

interface Props {
  analyses: MatchAnalysis[];
}

function TeamCrest({ crest, name }: { crest: string; name: string }) {
  if (crest.startsWith('http')) {
    return <img src={crest} alt={name} className="w-8 h-8 object-contain" />;
  }
  return <span className="text-2xl leading-none">{crest}</span>;
}

function ActionBadge({ action }: { action: 'bet' | 'small-stake' | 'no-bet' }) {
  const cfg = {
    bet: { cls: 'badge-green', label: '✓ BET' },
    'small-stake': { cls: 'badge-amber', label: '◐ SMALL' },
    'no-bet': { cls: 'badge-blue', label: '✗ NO BET' },
  }[action];
  return <span className={`badge ${cfg.cls} font-display font-bold`}>{cfg.label}</span>;
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const color =
    confidence >= 70 ? 'var(--edge-green)' :
    confidence >= 55 ? 'var(--edge-amber)' :
    'var(--text-muted)';
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="prob-bar flex-1">
        <div className="prob-bar-fill" style={{ width: `${confidence}%`, background: color }} />
      </div>
      <span className="font-mono text-xs font-bold shrink-0" style={{ color }}>
        {confidence}%
      </span>
    </div>
  );
}

export function MatchList({ analyses }: Props) {
  if (analyses.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-3xl mb-3">📭</div>
        <p className="font-display text-sm font-bold mb-1">No matches found</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis, i) => {
        const { match, prediction, homeStats, awayStats } = analysis;
        const decision = getBestBet(analysis);
        const kickoff = new Date(match.kickoff);
        const timeStr = kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const dateStr = kickoff.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        const isBet = decision.action !== 'no-bet';

        return (
          <Link
            key={match.id}
            href={`/match/${match.id}`}
            className={`card block cursor-pointer animate-slide-up hover:border-white/[0.14] transition-all ${isBet ? 'edge-glow' : ''}`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {/* Top row: league/time + badge */}
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                    {match.league.replace(/-/g, ' ')}
                  </span>
                  {match.status === 'live' && (
                    <span className="badge badge-red text-[10px]">LIVE</span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{dateStr} · {timeStr}</span>
              </div>
              <div className="shrink-0">
                <ActionBadge action={decision.action} />
              </div>
            </div>

            {/* Teams */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.name} />
                <span className="font-display text-sm font-bold truncate">{match.homeTeam.name}</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-display shrink-0">vs</span>
              <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                <span className="font-display text-sm font-bold truncate text-right">{match.awayTeam.name}</span>
                <TeamCrest crest={match.awayTeam.crest} name={match.awayTeam.name} />
              </div>
            </div>

            {/* Decision block */}
            {isBet ? (
              <div className="rounded-lg border border-white/[0.06] bg-[var(--surface-2)] p-3 mb-3 space-y-2">
                {/* Market + odds row */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Market</span>
                    <p className="text-sm font-bold text-[var(--edge-cyan)]">{decision.market}</p>
                  </div>
                  <div className="text-right">
                    {decision.odds && (
                      <>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Odds</span>
                        <p className="font-mono text-sm font-bold">{decision.odds.toFixed(2)}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Confidence</span>
                    {decision.edgePct !== undefined && (
                      <span className="text-[10px] font-mono text-[var(--edge-green)]">Edge +{decision.edgePct}%</span>
                    )}
                  </div>
                  <ConfidenceBar confidence={decision.confidence} />
                </div>

                {/* Reason */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-white/[0.04] pt-2">
                  {decision.reason}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.04] bg-[var(--surface-2)]/50 p-3 mb-3">
                <p className="text-xs font-bold text-[var(--text-muted)] mb-0.5">No clear edge — avoid</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{decision.reason}</p>
              </div>
            )}

            {/* Probability + form footer */}
            <div className="flex items-center gap-4">
              {/* Win probability bar */}
              <div className="flex-1">
                <div className="flex h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div style={{ width: `${prediction.homeWin * 100}%`, background: 'var(--edge-green)' }} />
                  <div style={{ width: `${prediction.draw * 100}%`, background: 'var(--edge-amber)' }} />
                  <div style={{ width: `${prediction.awayWin * 100}%`, background: 'var(--edge-blue)' }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[var(--edge-green)]">{(prediction.homeWin * 100).toFixed(0)}%</span>
                  <span className="text-[var(--edge-amber)]">{(prediction.draw * 100).toFixed(0)}%</span>
                  <span className="text-[var(--edge-blue)]">{(prediction.awayWin * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Form */}
              <div className="flex items-center gap-2 shrink-0">
                <FormDisplay form={homeStats.recentForm.slice(0, 5)} size="sm" />
                <span className="text-[var(--text-muted)] text-[10px]">vs</span>
                <FormDisplay form={awayStats.recentForm.slice(0, 5)} size="sm" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
