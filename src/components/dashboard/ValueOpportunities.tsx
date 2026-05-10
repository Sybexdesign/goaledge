'use client';

import type { MatchAnalysis } from '@/types';

interface Props {
  analyses: MatchAnalysis[];
}

export function ValueOpportunities({ analyses }: Props) {
  if (analyses.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-2xl mb-2">🎯</div>
        <p className="text-[var(--text-secondary)]">No value detected today.</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">That&apos;s discipline — not every day has an edge.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {analyses.map((analysis) =>
        analysis.valueOpportunities.map((opp, i) => (
          <div
            key={`${analysis.match.id}-${opp.market}`}
            className="card edge-glow animate-slide-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* Match header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{analysis.match.homeTeam.crest}</span>
                <span className="font-display text-sm font-bold">
                  {analysis.match.homeTeam.shortName} vs {analysis.match.awayTeam.shortName}
                </span>
                <span className="text-lg">{analysis.match.awayTeam.crest}</span>
              </div>
              <span className={`badge ${
                opp.confidence === 'high' ? 'badge-green' :
                opp.confidence === 'medium' ? 'badge-amber' : 'badge-red'
              }`}>
                {opp.confidence}
              </span>
            </div>

            {/* Market */}
            <div className="text-sm font-medium text-[var(--edge-cyan)] mb-2">
              {opp.market}
            </div>

            {/* Edge visualization */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <div className="text-xs text-[var(--text-muted)]">Model</div>
                <div className="font-mono text-sm font-bold text-[var(--edge-green)]">
                  {(opp.modelProbability * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">Market</div>
                <div className="font-mono text-sm font-bold text-[var(--text-secondary)]">
                  {(opp.impliedProbability * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">Edge</div>
                <div className="font-mono text-sm font-bold text-[var(--edge-green)]">
                  +{(opp.edge * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Edge bar */}
            <div className="prob-bar mb-3">
              <div
                className="prob-bar-fill"
                style={{
                  width: `${Math.min(opp.edge * 100 * 8, 100)}%`,
                  background: `linear-gradient(90deg, var(--edge-green), var(--edge-cyan))`,
                }}
              />
            </div>

            {/* Odds + risk */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">
                Odds: <span className="font-mono text-[var(--text-secondary)]">{opp.odds.toFixed(2)}</span>
              </span>
              <span className={`badge ${
                opp.riskLevel === 'low' ? 'badge-green' :
                opp.riskLevel === 'medium' ? 'badge-amber' : 'badge-red'
              }`}>
                {opp.riskLevel} risk
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
