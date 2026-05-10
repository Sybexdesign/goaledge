import type { Prediction, BookmakerOdds, ValueOpportunity, ConfidenceLevel, RiskLevel } from '@/types';

/**
 * Convert decimal odds to implied probability
 * e.g. odds of 2.00 → 50% implied probability
 */
export function impliedProbability(decimalOdds: number): number {
  return 1 / decimalOdds;
}

/**
 * Calculate edge: model probability minus implied probability
 * Positive edge = potential value
 */
export function calculateEdge(modelProb: number, decimalOdds: number): number {
  return modelProb - impliedProbability(decimalOdds);
}

/**
 * Determine confidence level based on edge magnitude and model certainty
 */
function assessConfidence(edge: number, modelProb: number): ConfidenceLevel {
  // High confidence: strong edge + model is fairly certain
  if (edge > 0.08 && modelProb > 0.5) return 'high';
  // Medium: moderate edge or moderate probability
  if (edge > 0.04 || modelProb > 0.45) return 'medium';
  return 'low';
}

/**
 * Determine risk level
 * Higher odds = higher risk. Low-probability events are riskier.
 */
function assessRisk(modelProb: number, odds: number): RiskLevel {
  if (modelProb < 0.3 || odds > 4.0) return 'high';
  if (modelProb < 0.45 || odds > 2.5) return 'medium';
  return 'low';
}

/**
 * Minimum edge threshold to flag as value
 * Below this, market efficiency makes it noise
 */
const MIN_EDGE_THRESHOLD = 0.03; // 3%

/**
 * Detect value opportunities across all markets
 */
export function detectValue(prediction: Prediction, odds: BookmakerOdds): ValueOpportunity[] {
  const opportunities: ValueOpportunity[] = [];

  const markets: { name: string; modelProb: number; odds: number | undefined }[] = [
    { name: 'Home Win', modelProb: prediction.homeWin, odds: odds.homeWin },
    { name: 'Draw', modelProb: prediction.draw, odds: odds.draw },
    { name: 'Away Win', modelProb: prediction.awayWin, odds: odds.awayWin },
    { name: 'Over 2.5 Goals', modelProb: prediction.over25, odds: odds.over25 },
    { name: 'Under 2.5 Goals', modelProb: prediction.under25, odds: odds.under25 },
    { name: 'Both Teams to Score', modelProb: prediction.btts, odds: odds.btts },
  ];

  for (const market of markets) {
    if (!market.odds || market.odds <= 1) continue;

    const edge = calculateEdge(market.modelProb, market.odds);

    if (edge >= MIN_EDGE_THRESHOLD) {
      opportunities.push({
        market: market.name,
        modelProbability: market.modelProb,
        impliedProbability: impliedProbability(market.odds),
        edge,
        odds: market.odds,
        confidence: assessConfidence(edge, market.modelProb),
        riskLevel: assessRisk(market.modelProb, market.odds),
      });
    }
  }

  // Sort by edge descending
  return opportunities.sort((a, b) => b.edge - a.edge);
}

/**
 * Check if odds have moved significantly (sharp money indicator)
 */
export function detectOddsMovement(
  openingOdds: number,
  currentOdds: number,
  threshold = 0.15
): { moved: boolean; direction: 'shortened' | 'drifted' | 'stable'; magnitude: number } {
  const change = (currentOdds - openingOdds) / openingOdds;

  if (Math.abs(change) < threshold) {
    return { moved: false, direction: 'stable', magnitude: Math.abs(change) };
  }

  return {
    moved: true,
    direction: change < 0 ? 'shortened' : 'drifted',
    magnitude: Math.abs(change),
  };
}
