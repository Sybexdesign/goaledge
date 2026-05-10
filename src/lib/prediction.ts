import type { Prediction, TeamStats } from '@/types';

/**
 * Poisson probability mass function
 * P(X = k) = (λ^k * e^(-λ)) / k!
 */
function poissonPMF(lambda: number, k: number): number {
  let factorial = 1;
  for (let i = 2; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

/**
 * Generate score probability matrix using Poisson distribution
 * Returns P(homeGoals = i, awayGoals = j) for i,j in [0, maxGoals]
 */
function scoreMatrix(homeLambda: number, awayLambda: number, maxGoals = 6): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i <= maxGoals; i++) {
    matrix[i] = [];
    for (let j = 0; j <= maxGoals; j++) {
      matrix[i][j] = poissonPMF(homeLambda, i) * poissonPMF(awayLambda, j);
    }
  }
  return matrix;
}

/**
 * Calculate match outcome probabilities from a score matrix
 */
function outcomeProbabilities(matrix: number[][]) {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over25 = 0;
  let btts = 0;

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const p = matrix[i][j];
      if (i > j) homeWin += p;
      else if (i === j) draw += p;
      else awayWin += p;

      if (i + j > 2) over25 += p;
      if (i > 0 && j > 0) btts += p;
    }
  }

  return { homeWin, draw, awayWin, over25, under25: 1 - over25, btts };
}

/**
 * Calculate expected goals from team stats
 * Uses weighted combination of xG, actual goals, and form
 */
function estimateLambda(
  attackStats: TeamStats,
  defenseStats: TeamStats,
  leagueAvgGoals = 1.35, // avg goals per team per match
  isHome: boolean = true
): number {
  // Attack strength = team's xG / league average
  const attackStrength = attackStats.xG / leagueAvgGoals;

  // Defense weakness = opponent's xGA / league average
  const defenseWeakness = defenseStats.xGA / leagueAvgGoals;

  // Form factor: recent results weighted
  const formWeight = calculateFormWeight(attackStats.recentForm);

  // Base lambda
  let lambda = leagueAvgGoals * attackStrength * defenseWeakness * formWeight;

  // Home advantage adjustment (~15% boost historically)
  if (isHome) lambda *= 1.15;
  else lambda *= 0.88;

  // Clamp to reasonable range
  return Math.max(0.3, Math.min(4.0, lambda));
}

/**
 * Convert recent form to a multiplier
 * W=1.0, D=0.5, L=0.0 — weighted more heavily for recent matches
 */
function calculateFormWeight(form: ('W' | 'D' | 'L')[]): number {
  if (form.length === 0) return 1.0;

  const weights = form.map((_, i) => 1 + (i === 0 ? 0.3 : i === 1 ? 0.2 : i === 2 ? 0.1 : 0));
  const values = form.map((r) => (r === 'W' ? 1.0 : r === 'D' ? 0.5 : 0.0));

  const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Normalize around 1.0 (0.7–1.3 range)
  const raw = weightedSum / totalWeight;
  return 0.7 + raw * 0.6;
}

/**
 * Main prediction function
 * Takes team stats and produces match prediction
 */
export function predictMatch(homeStats: TeamStats, awayStats: TeamStats): Prediction {
  const homeLambda = estimateLambda(homeStats, awayStats, 1.35, true);
  const awayLambda = estimateLambda(awayStats, homeStats, 1.35, false);

  const matrix = scoreMatrix(homeLambda, awayLambda);
  const probs = outcomeProbabilities(matrix);

  return {
    homeWin: Number(probs.homeWin.toFixed(4)),
    draw: Number(probs.draw.toFixed(4)),
    awayWin: Number(probs.awayWin.toFixed(4)),
    over25: Number(probs.over25.toFixed(4)),
    under25: Number(probs.under25.toFixed(4)),
    btts: Number(probs.btts.toFixed(4)),
    expectedGoals: {
      home: Number(homeLambda.toFixed(2)),
      away: Number(awayLambda.toFixed(2)),
    },
  };
}
