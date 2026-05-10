import type { BankrollConfig, StakeSuggestion, ValueOpportunity } from '@/types';

/**
 * Full Kelly Criterion stake calculation
 * f* = (bp - q) / b
 * where b = decimal odds - 1, p = probability of winning, q = 1 - p
 */
function fullKelly(probability: number, decimalOdds: number): number {
  const b = decimalOdds - 1;
  const p = probability;
  const q = 1 - p;

  const kelly = (b * p - q) / b;

  // Never return negative (would mean no bet)
  return Math.max(0, kelly);
}

/**
 * Calculate recommended stake using fractional Kelly
 *
 * Full Kelly is mathematically optimal but aggressive.
 * Quarter Kelly (0.25) is standard for risk-averse bettors.
 * Half Kelly (0.5) for moderate risk tolerance.
 */
export function calculateStake(
  opportunity: ValueOpportunity,
  bankroll: BankrollConfig
): StakeSuggestion {
  const kellyFraction = bankroll.kellyFraction || 0.25; // default quarter Kelly
  const maxPercent = bankroll.maxStakePercent || 0.03;   // default 3% max

  // Calculate full Kelly stake percentage
  const fullKellyPct = fullKelly(opportunity.modelProbability, opportunity.odds);

  // Apply fraction
  let stakePct = fullKellyPct * kellyFraction;

  // Cap at maximum allowed stake
  stakePct = Math.min(stakePct, maxPercent);

  // Round down to nearest 0.1%
  stakePct = Math.floor(stakePct * 1000) / 1000;

  const amount = Number((bankroll.total * stakePct).toFixed(2));

  // Generate reasoning
  let reasoning: string;

  if (stakePct === 0) {
    reasoning = 'Kelly criterion suggests no stake. Edge is insufficient to justify risk.';
  } else if (stakePct < 0.005) {
    reasoning = `Minimal edge detected. Micro stake of ${(stakePct * 100).toFixed(1)}% to maintain discipline.`;
  } else if (stakePct < 0.015) {
    reasoning = `Moderate edge at ${(opportunity.edge * 100).toFixed(1)}%. Standard stake recommended.`;
  } else {
    reasoning = `Strong edge detected. Staking at ${(stakePct * 100).toFixed(1)}% (capped at ${(maxPercent * 100).toFixed(0)}% max).`;
  }

  return {
    amount,
    percentOfBankroll: stakePct,
    kellyStake: fullKellyPct,
    reasoning,
  };
}

/**
 * Calculate discipline score based on betting history
 * Rewards: consistent sizing, following recommendations, avoiding tilts
 * Penalizes: oversized bets, emotional betting, chasing losses
 */
export function calculateDisciplineScore(
  bets: { stake: number; recommended: number; followedAdvice: boolean; timeSinceLast: number }[]
): number {
  if (bets.length === 0) return 100;

  let score = 100;

  for (const bet of bets) {
    // Penalize oversized bets
    if (bet.stake > bet.recommended * 1.5) {
      score -= 5;
    }

    // Penalize ignoring no-bet recommendations
    if (!bet.followedAdvice) {
      score -= 3;
    }

    // Penalize rapid-fire betting (< 10 min gap = potential tilt)
    if (bet.timeSinceLast < 10) {
      score -= 4;
    }
  }

  return Math.max(0, Math.min(100, score));
}
