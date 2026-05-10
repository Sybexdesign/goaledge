'use client';

import type { MatchAnalysis } from '@/types';
import { FormDisplay } from '@/components/match/FormDisplay';

interface Props {
  analyses: MatchAnalysis[];
}

export function MatchList({ analyses }: Props) {
  return (
    <div className="space-y-3">
      {analyses.map((analysis, i) => {
        const { match, prediction, aiAnalysis, valueOpportunities } = analysis;
        const hasValue = valueOpportunities.length > 0;
        const kickoff = new Date(match.kickoff);
        const timeStr = kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        return (
          <div
            key={match.id}
            className={`card cursor-pointer animate-slide-up ${hasValue ? 'edge-glow' : ''}`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Match info */}
              <div className="flex-1 min-w-0">
                {/* League + time */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">
                    {match.league.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">•</span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{timeStr}</span>
                  {hasValue && (
                    <span className="badge badge-green text-[10px]">VALUE</span>
                  )}
                </div>

                {/* Teams */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xl">{match.homeTeam.crest}</span>
                    <span className="font-display text-sm font-bold truncate">{match.homeTeam.name}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-display">vs</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-display text-sm font-bold truncate text-right">{match.awayTeam.name}</span>
                    <span className="text-xl">{match.awayTeam.crest}</span>
                  </div>
                </div>

                {/* Probability bar */}
                <div className="flex h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="transition-all duration-500"
                    style={{
                      width: `${prediction.homeWin * 100}%`,
                      background: 'var(--edge-green)',
                    }}
                  />
                  <div
                    className="transition-all duration-500"
                    style={{
                      width: `${prediction.draw * 100}%`,
                      background: 'var(--edge-amber)',
                    }}
                  />
                  <div
                    className="transition-all duration-500"
                    style={{
                      width: `${prediction.awayWin * 100}%`,
                      background: 'var(--edge-blue)',
                    }}
                  />
                </div>

                {/* Probability labels */}
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--edge-green)]">{(prediction.homeWin * 100).toFixed(0)}%</span>
                  <span className="text-[var(--edge-amber)]">{(prediction.draw * 100).toFixed(0)}%</span>
                  <span className="text-[var(--edge-blue)]">{(prediction.awayWin * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Recommendation badge */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`badge ${
                  aiAnalysis.recommendation === 'bet' ? 'badge-green' :
                  aiAnalysis.recommendation === 'small-stake' ? 'badge-amber' :
                  aiAnalysis.recommendation === 'no-bet' ? 'badge-blue' : 'badge-red'
                }`}>
                  {aiAnalysis.recommendation === 'bet' ? '✓ BET' :
                   aiAnalysis.recommendation === 'small-stake' ? '◐ SMALL' :
                   aiAnalysis.recommendation === 'no-bet' ? '✗ NO BET' : '⚠ AVOID'}
                </span>

                <div className="flex gap-1">
                  <FormDisplay form={analysis.homeStats.recentForm.slice(0, 3)} size="sm" />
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="mt-3 pt-3 border-t border-white/[0.04]">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {aiAnalysis.summary}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
