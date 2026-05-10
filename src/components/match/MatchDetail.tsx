'use client';

import type { MatchAnalysis } from '@/types';
import { FormDisplay } from './FormDisplay';

interface Props {
  analysis: MatchAnalysis;
}

function TeamCrestLg({ crest, name }: { crest: string; name: string }) {
  if (crest.startsWith('http')) {
    return <img src={crest} alt={name} className="w-16 h-16 object-contain" />;
  }
  return <span className="text-5xl leading-none">{crest}</span>;
}

export function MatchDetail({ analysis }: Props) {
  const { match, prediction, odds, aiAnalysis, valueOpportunities, homeStats, awayStats, homeSquad, awaySquad } = analysis;
  const kickoff = new Date(match.kickoff);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Match header */}
      <div className="card text-center py-8 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--edge-green)]/[0.03] to-transparent pointer-events-none" />

        <div className="relative">
          <div className="label-xs mb-5">
            {match.league.replace(/-/g, ' ')} &nbsp;·&nbsp;
            {kickoff.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} &nbsp;·&nbsp;
            {kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-12">
            <div className="text-center flex-1">
              <div className="flex justify-center mb-3">
                <TeamCrestLg crest={match.homeTeam.crest} name={match.homeTeam.name} />
              </div>
              <div className="font-display text-base sm:text-lg font-bold mb-2">{match.homeTeam.name}</div>
              <div className="flex justify-center"><FormDisplay form={homeStats.recentForm} /></div>
            </div>

            <div className="shrink-0 text-center">
              <div className="font-display text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">vs</div>
              <div className="w-px h-8 bg-[var(--border-subtle)] mx-auto" />
            </div>

            <div className="text-center flex-1">
              <div className="flex justify-center mb-3">
                <TeamCrestLg crest={match.awayTeam.crest} name={match.awayTeam.name} />
              </div>
              <div className="font-display text-base sm:text-lg font-bold mb-2">{match.awayTeam.name}</div>
              <div className="flex justify-center"><FormDisplay form={awayStats.recentForm} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Home Win', prob: prediction.homeWin, odds: odds.homeWin, color: 'var(--edge-green)' },
          { label: 'Draw', prob: prediction.draw, odds: odds.draw, color: 'var(--edge-amber)' },
          { label: 'Away Win', prob: prediction.awayWin, odds: odds.awayWin, color: 'var(--edge-blue)' },
        ].map((item) => {
          const implied = 1 / item.odds;
          const edge = item.prob - implied;
          const hasEdge = edge >= 0.03;

          return (
            <div key={item.label} className={`card ${hasEdge ? 'edge-glow' : ''}`}>
              <div className="text-xs text-[var(--text-muted)] mb-1">{item.label}</div>
              <div className="font-display text-3xl font-bold" style={{ color: item.color }}>
                {(item.prob * 100).toFixed(0)}%
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-[var(--text-muted)]">
                  Odds: <span className="font-mono">{item.odds.toFixed(2)}</span>
                </span>
                {hasEdge && (
                  <span className="font-mono text-[var(--edge-green)]">+{(edge * 100).toFixed(1)}%</span>
                )}
              </div>
              <div className="prob-bar mt-2">
                <div className="prob-bar-fill" style={{ width: `${item.prob * 100}%`, background: item.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary markets */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Over 2.5', prob: prediction.over25, odds: odds.over25 },
          { label: 'Under 2.5', prob: prediction.under25, odds: odds.under25 },
          { label: 'BTTS', prob: prediction.btts, odds: odds.btts },
        ].map((item) => (
          <div key={item.label} className="card">
            <div className="text-xs text-[var(--text-muted)] mb-1">{item.label}</div>
            <div className="font-mono text-xl font-bold">{(item.prob * 100).toFixed(0)}%</div>
            {item.odds && (
              <div className="text-xs text-[var(--text-muted)] mt-1">
                @ <span className="font-mono">{item.odds.toFixed(2)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expected Goals */}
      <div className="card">
        <h3 className="font-display text-sm font-bold mb-3 text-[var(--text-secondary)]">Expected Goals</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 text-right">
            <span className="font-display text-3xl font-bold text-[var(--edge-green)]">
              {prediction.expectedGoals.home.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-[var(--text-muted)]">xG</div>
          <div className="flex-1">
            <span className="font-display text-3xl font-bold text-[var(--edge-blue)]">
              {prediction.expectedGoals.away.toFixed(2)}
            </span>
          </div>
        </div>
        {/* xG bar */}
        <div className="flex h-3 rounded-full overflow-hidden mt-3">
          <div
            style={{
              width: `${(prediction.expectedGoals.home / (prediction.expectedGoals.home + prediction.expectedGoals.away)) * 100}%`,
              background: 'var(--edge-green)',
            }}
          />
          <div
            style={{
              width: `${(prediction.expectedGoals.away / (prediction.expectedGoals.home + prediction.expectedGoals.away)) * 100}%`,
              background: 'var(--edge-blue)',
            }}
          />
        </div>
      </div>

      {/* AI Analysis */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold text-[var(--text-secondary)]">
            AI Analysis
          </h3>
          <span className={`badge ${
            aiAnalysis.confidence === 'high' ? 'badge-green' :
            aiAnalysis.confidence === 'medium' ? 'badge-amber' : 'badge-red'
          }`}>
            {aiAnalysis.confidence} confidence
          </span>
        </div>

        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
          {aiAnalysis.summary}
        </p>

        {/* Reasoning */}
        <div className="mb-4">
          <div className="text-xs text-[var(--text-muted)] font-medium mb-2 uppercase tracking-wider">Reasoning</div>
          <div className="space-y-2">
            {aiAnalysis.reasoning.map((point, i) => (
              <div key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--edge-cyan)] shrink-0">›</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk factors */}
        <div className="mb-4">
          <div className="text-xs text-[var(--text-muted)] font-medium mb-2 uppercase tracking-wider">Risk Factors</div>
          <div className="space-y-2">
            {aiAnalysis.riskFactors.map((risk, i) => (
              <div key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--edge-amber)] shrink-0">⚠</span>
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contradictions */}
        {aiAnalysis.contradictions && aiAnalysis.contradictions.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-[var(--text-muted)] font-medium mb-2 uppercase tracking-wider">Contradictions</div>
            <div className="space-y-2">
              {aiAnalysis.contradictions.map((c, i) => (
                <div key={i} className="flex gap-2 text-sm text-[var(--edge-red)]">
                  <span className="shrink-0">⟐</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value assessment */}
        <div className="p-3 rounded-lg bg-[var(--surface-2)] mb-4">
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Value Assessment</div>
          <p className="text-sm text-[var(--text-primary)]">{aiAnalysis.valueAssessment}</p>
        </div>

        {/* Recommendation */}
        <div className={`p-4 rounded-lg border ${
          aiAnalysis.recommendation === 'bet' ? 'border-[var(--edge-green)]/30 bg-[var(--edge-green)]/5' :
          aiAnalysis.recommendation === 'small-stake' ? 'border-[var(--edge-amber)]/30 bg-[var(--edge-amber)]/5' :
          'border-[var(--edge-blue)]/30 bg-[var(--edge-blue)]/5'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${
              aiAnalysis.recommendation === 'bet' ? 'badge-green' :
              aiAnalysis.recommendation === 'small-stake' ? 'badge-amber' :
              aiAnalysis.recommendation === 'no-bet' ? 'badge-blue' : 'badge-red'
            }`}>
              {aiAnalysis.recommendation.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-[var(--text-primary)] font-medium">
            {aiAnalysis.recommendationText}
          </p>
        </div>
      </div>

      {/* Squad signals */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { team: match.homeTeam, squad: homeSquad, stats: homeStats },
          { team: match.awayTeam, squad: awaySquad, stats: awayStats },
        ].map(({ team, squad, stats }) => (
          <div key={team.id} className="card">
            <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
              {team.crest.startsWith('http')
                ? <img src={team.crest} alt={team.shortName} className="w-5 h-5 object-contain" />
                : <span>{team.crest}</span>
              }
              {team.shortName}
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">xG</span>
                <span className="font-mono">{stats.xG.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">xGA</span>
                <span className="font-mono">{stats.xGA.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Clean Sheets</span>
                <span className="font-mono">{stats.cleanSheets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Possession</span>
                <span className="font-mono">{stats.avgPossession}%</span>
              </div>
              {squad.injuries.length > 0 && (
                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-[var(--edge-red)]">Injuries: </span>
                  <span className="text-[var(--text-secondary)]">{squad.injuries.join(', ')}</span>
                </div>
              )}
              {squad.suspensions.length > 0 && (
                <div>
                  <span className="text-[var(--edge-amber)]">Suspended: </span>
                  <span className="text-[var(--text-secondary)]">{squad.suspensions.join(', ')}</span>
                </div>
              )}
              {squad.fixtureCongesion && (
                <div className="badge badge-amber mt-1">Fixture congestion</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
