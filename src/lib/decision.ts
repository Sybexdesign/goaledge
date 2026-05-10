import type { MatchAnalysis, ValueOpportunity } from '@/types';

export interface BetDecision {
  action: 'bet' | 'small-stake' | 'no-bet';
  market?: string;
  confidence: number; // 0–100
  odds?: number;
  edgePct?: number;
  reason: string;
}

/**
 * Determines the best single bet from a match analysis.
 * Returns no-bet when no edge meets the minimum threshold.
 */
export function getBestBet(analysis: MatchAnalysis): BetDecision {
  const { valueOpportunities, prediction, homeStats, awayStats, match } = analysis;

  // Require meaningful edge (>3%) to even consider
  const viable = valueOpportunities.filter(o => o.edge >= 0.03);

  if (viable.length === 0) {
    return {
      action: 'no-bet',
      confidence: 0,
      reason: 'No statistical edge found — market is efficiently priced.',
    };
  }

  const best = viable[0]; // already sorted edge descending
  const confidence = Math.min(92, Math.round(50 + best.edge * 400));

  // Only recommend bet when confidence is meaningful
  if (confidence < 58) {
    return {
      action: 'no-bet',
      confidence,
      market: best.market,
      odds: best.odds,
      edgePct: +(best.edge * 100).toFixed(1),
      reason: `Edge too thin (+${(best.edge * 100).toFixed(1)}%) — not worth the risk.`,
    };
  }

  const action = confidence >= 70 ? 'bet' : 'small-stake';

  return {
    action,
    market: best.market,
    confidence,
    odds: best.odds,
    edgePct: +(best.edge * 100).toFixed(1),
    reason: buildReason(best, analysis),
  };
}

function buildReason(opp: ValueOpportunity, analysis: MatchAnalysis): string {
  const { homeStats, awayStats, match, prediction } = analysis;
  const h = match.homeTeam.shortName;
  const a = match.awayTeam.shortName;
  const totalXG = (prediction.expectedGoals.home + prediction.expectedGoals.away).toFixed(1);

  switch (opp.market) {
    case 'Over 2.5 Goals':
      return `Combined xG ${totalXG}. ${h} scoring ${homeStats.xG.toFixed(1)}/game, ${a} conceding ${awayStats.xGA.toFixed(1)}/game.`;
    case 'Both Teams to Score': {
      return `${h} xG ${homeStats.xG.toFixed(1)}, ${a} xG ${awayStats.xG.toFixed(1)}. Both sides creating chances.`;
    }
    case 'Home Win':
      return `${h} form: ${homeStats.recentForm.slice(0, 3).join('')}. ${a} conceding ${awayStats.xGA.toFixed(1)} xGA/game away.`;
    case 'Away Win':
      return `${a} form: ${awayStats.recentForm.slice(0, 3).join('')}. ${h} conceding ${homeStats.xGA.toFixed(1)} xGA/game at home.`;
    case 'Under 2.5 Goals':
      return `Low-scoring setup. Combined xG only ${totalXG}. Strong defensive indicators.`;
    case 'Draw':
      return `Closely matched. Model ${(opp.modelProbability * 100).toFixed(0)}% vs market ${(opp.impliedProbability * 100).toFixed(0)}% implied.`;
    default:
      return `Model ${(opp.modelProbability * 100).toFixed(0)}% vs market ${(opp.impliedProbability * 100).toFixed(0)}%. Edge +${(opp.edge * 100).toFixed(1)}%.`;
  }
}
