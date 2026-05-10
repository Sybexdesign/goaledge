'use client';

import Link from 'next/link';
import type { MatchAnalysis } from '@/types';
import { getBestBet } from '@/lib/decision';

interface Props {
  analyses: MatchAnalysis[];
}

function TeamCrest({ crest, name }: { crest: string; name: string }) {
  if (crest.startsWith('http')) {
    return <img src={crest} alt={name} className="w-10 h-10 object-contain" />;
  }
  return <span className="text-3xl leading-none">{crest}</span>;
}

function ConfidenceRing({ confidence }: { confidence: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const filled = (confidence / 100) * circumference;
  const color =
    confidence >= 75 ? '#00e676' :
    confidence >= 62 ? '#ffab00' :
    '#2979ff';

  return (
    <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="font-mono text-xs font-bold" style={{ color }}>{confidence}%</span>
    </div>
  );
}

export function BestPicks({ analyses }: Props) {
  const picks = analyses
    .map(a => ({ analysis: a, decision: getBestBet(a) }))
    .filter(({ decision }) => decision.action !== 'no-bet' && decision.confidence >= 62)
    .sort((a, b) => b.decision.confidence - a.decision.confidence)
    .slice(0, 10);

  if (picks.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Best Picks Today</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">High-confidence model opportunities</p>
          </div>
        </div>
        <div className="card text-center py-8 border-dashed">
          <p className="font-display text-sm font-bold text-[var(--text-muted)] mb-1">No clear edge today</p>
          <p className="text-xs text-[var(--text-muted)]">
            That&apos;s discipline — the model found no bets that clear the confidence threshold.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight flex items-center gap-2">
            Best Picks Today
            <span className="w-2 h-2 rounded-full bg-[var(--edge-green)] animate-pulse inline-block" />
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {picks.length} {picks.length === 1 ? 'opportunity' : 'opportunities'} with confirmed model edge
          </p>
        </div>
        <span className="badge badge-green font-display font-bold">
          {picks.length} picks
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {picks.map(({ analysis, decision }, i) => {
          const { match, prediction } = analysis;
          const kickoff = new Date(match.kickoff);
          const timeStr = kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

          return (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              className="relative block rounded-xl border border-[var(--edge-green)]/25 bg-gradient-to-b from-[var(--edge-green)]/[0.04] to-transparent p-4 hover:border-[var(--edge-green)]/50 hover:from-[var(--edge-green)]/[0.07] transition-all animate-slide-up group"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Rank badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">#{i + 1}</span>
              </div>

              {/* League + time */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {match.league.replace(/-/g, ' ')}
                </span>
                <span className="text-[var(--text-muted)] text-[10px]">•</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{timeStr}</span>
              </div>

              {/* Teams row */}
              <div className="flex items-center gap-2 mb-4">
                <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs font-bold truncate">{match.homeTeam.shortName}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">vs</p>
                  <p className="font-display text-xs font-bold truncate">{match.awayTeam.shortName}</p>
                </div>
                <ConfidenceRing confidence={decision.confidence} />
              </div>

              {/* Market */}
              <div className="mb-3">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-0.5">Market</p>
                <p className="text-sm font-bold text-[var(--edge-cyan)]">{decision.market}</p>
                {decision.odds && (
                  <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">@ {decision.odds.toFixed(2)}</p>
                )}
              </div>

              {/* Edge bar */}
              {decision.edgePct !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Model edge</span>
                    <span className="text-[10px] font-mono font-bold text-[var(--edge-green)]">+{decision.edgePct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--surface-3)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, decision.edgePct * 7)}%`,
                        background: 'linear-gradient(90deg, var(--edge-green), var(--edge-cyan))',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-white/[0.04] pt-3">
                {decision.reason}
              </p>

              {/* Probability mini bar */}
              <div className="mt-3 flex h-1 rounded-full overflow-hidden">
                <div style={{ width: `${prediction.homeWin * 100}%`, background: 'var(--edge-green)' }} />
                <div style={{ width: `${prediction.draw * 100}%`, background: 'var(--edge-amber)' }} />
                <div style={{ width: `${prediction.awayWin * 100}%`, background: 'var(--edge-blue)' }} />
              </div>

              {/* Arrow hint */}
              <div className="absolute bottom-4 right-4 text-[var(--text-muted)] group-hover:text-[var(--edge-green)] transition-colors text-xs">
                →
              </div>
            </Link>
          );
        })}
      </div>

      {/* No edge fallback — not rendered (picks.length === 0 returns null above) */}
    </section>
  );
}
