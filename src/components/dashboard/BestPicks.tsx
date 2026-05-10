'use client';

import Link from 'next/link';
import type { MatchAnalysis } from '@/types';
import { getBestBet } from '@/lib/decision';

interface Props {
  analyses: MatchAnalysis[];
}

const ACTION_CONFIG = {
  'bet':         { label: 'BET',     bg: 'bg-[var(--edge-green)]/12',  border: 'border-[var(--edge-green)]/30',  text: 'text-[var(--edge-green)]',  dot: 'bg-[var(--edge-green)]'  },
  'small-stake': { label: 'CAUTIOUS', bg: 'bg-[var(--edge-amber)]/10',  border: 'border-[var(--edge-amber)]/30',  text: 'text-[var(--edge-amber)]',  dot: 'bg-[var(--edge-amber)]'  },
  'no-bet':      { label: 'AVOID',   bg: 'bg-[var(--surface-2)]',       border: 'border-[var(--border-subtle)]', text: 'text-[var(--text-muted)]',  dot: 'bg-[var(--text-muted)]'  },
};

function TeamCrest({ crest, name }: { crest: string; name: string }) {
  if (crest.startsWith('http')) {
    return <img src={crest} alt={name} className="w-9 h-9 object-contain" />;
  }
  return <span className="text-3xl leading-none">{crest}</span>;
}

function ConfidenceRing({ confidence, action }: { confidence: number; action: string }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const filled = (confidence / 100) * circ;
  const color = action === 'bet' ? 'var(--edge-green)' : action === 'small-stake' ? 'var(--edge-amber)' : 'var(--text-muted)';

  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="font-mono text-[11px] font-bold" style={{ color }}>{confidence}%</span>
    </div>
  );
}

export function BestPicks({ analyses }: Props) {
  const picks = analyses
    .map(a => ({ analysis: a, decision: getBestBet(a) }))
    .filter(({ decision }) => decision.action !== 'no-bet' && decision.confidence >= 62)
    .sort((a, b) => b.decision.confidence - a.decision.confidence)
    .slice(0, 10);

  const betCount = picks.filter(p => p.decision.action === 'bet').length;
  const cautionCount = picks.filter(p => p.decision.action === 'small-stake').length;

  if (picks.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Best Picks Today</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Top opportunities ranked by model edge</p>
          </div>
        </div>
        <div className="card text-center py-10 border-dashed">
          <p className="font-display text-sm font-bold text-[var(--text-muted)] mb-1">No clear edge today</p>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
            The model found no opportunities clearing the minimum confidence threshold. That&apos;s discipline.
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
            {betCount > 0 && `${betCount} strong bet${betCount !== 1 ? 's' : ''}`}
            {betCount > 0 && cautionCount > 0 && ' · '}
            {cautionCount > 0 && `${cautionCount} cautious stake${cautionCount !== 1 ? 's' : ''}`}
            {' — ranked by confidence'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {betCount > 0 && <span className="badge badge-green">{betCount} BET</span>}
          {cautionCount > 0 && <span className="badge badge-amber">{cautionCount} CAUTIOUS</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {picks.map(({ analysis, decision }, i) => {
          const { match, prediction } = analysis;
          const cfg = ACTION_CONFIG[decision.action];
          const kickoff = new Date(match.kickoff);
          const timeStr = kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const dateStr = kickoff.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

          return (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              className={`relative block rounded-xl border ${cfg.border} ${cfg.bg} p-4 hover:opacity-90 transition-all animate-slide-up group`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Rank + action badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">#{i + 1}</span>
              </div>

              {/* League + time */}
              <div className="mb-2">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider leading-tight">
                  {match.league.replace(/-/g, ' ')}
                </p>
                <p className="text-[10px] font-mono text-[var(--text-muted)]">{dateStr} · {timeStr}</p>
              </div>

              {/* Teams + confidence ring */}
              <div className="flex items-center gap-2 mb-3">
                <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs font-bold truncate">{match.homeTeam.shortName}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">vs</p>
                  <p className="font-display text-xs font-bold truncate">{match.awayTeam.shortName}</p>
                </div>
                <ConfidenceRing confidence={decision.confidence} action={decision.action} />
              </div>

              {/* Market + odds */}
              <div className="mb-2.5">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-0.5">Best market</p>
                <p className="text-sm font-bold text-[var(--edge-cyan)]">{decision.market}</p>
                {decision.odds && (
                  <p className="text-xs font-mono text-[var(--text-muted)]">@ {decision.odds.toFixed(2)}</p>
                )}
              </div>

              {/* Edge bar */}
              {decision.edgePct !== undefined && (
                <div className="mb-2.5">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-[var(--text-muted)]">Model edge</span>
                    <span className="font-mono font-bold text-[var(--edge-green)]">+{decision.edgePct}%</span>
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

              {/* Reasoning */}
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed border-t border-white/[0.05] pt-2.5">
                {decision.reason}
              </p>

              {/* Prob bar */}
              <div className="mt-2.5 flex h-1 rounded-full overflow-hidden">
                <div style={{ width: `${prediction.homeWin * 100}%`, background: 'var(--edge-green)' }} />
                <div style={{ width: `${prediction.draw * 100}%`, background: 'var(--edge-amber)' }} />
                <div style={{ width: `${prediction.awayWin * 100}%`, background: 'var(--edge-blue)' }} />
              </div>
              <div className="flex justify-between mt-1 text-[9px] font-mono text-[var(--text-muted)]">
                <span>{(prediction.homeWin * 100).toFixed(0)}%</span>
                <span>{(prediction.draw * 100).toFixed(0)}%</span>
                <span>{(prediction.awayWin * 100).toFixed(0)}%</span>
              </div>

              {/* Arrow */}
              <div className={`absolute bottom-4 right-4 text-[10px] ${cfg.text} opacity-40 group-hover:opacity-100 transition-opacity`}>→</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
