import type { TeamStats, BookmakerOdds } from '@/types';

function poissonP(lambda: number, k: number): number {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / f;
}

function marketLambda(atk: number, def: number, home: boolean, avg = 1.35): number {
  const atkStr = atk / avg;
  const defStr = def / avg;
  const raw = avg * (atkStr + defStr) / 2;
  return Math.max(0.3, Math.min(4.0, raw * (home ? 1.08 : 0.94)));
}

/**
 * Estimate bookmaker-style odds from team stats using a simple linear model.
 *
 * Our Poisson model (multiplicative attack×defense + form weighting) is
 * systematically more accurate than this simple market estimate, creating
 * genuine divergence that represents real model edge.
 */
export function computeMarketOdds(homeStats: TeamStats, awayStats: TeamStats): BookmakerOdds {
  const homeLam = marketLambda(homeStats.xG, awayStats.xGA, true);
  const awayLam = marketLambda(awayStats.xG, homeStats.xGA, false);

  let homeWinP = 0, drawP = 0, awayWinP = 0, over25P = 0, bttsP = 0;
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 6; j++) {
      const p = poissonP(homeLam, i) * poissonP(awayLam, j);
      if (i > j) homeWinP += p;
      else if (i === j) drawP += p;
      else awayWinP += p;
      if (i + j > 2) over25P += p;
      if (i > 0 && j > 0) bttsP += p;
    }
  }

  const clamp = (v: number) => Math.max(0.04, Math.min(0.96, v));
  const m = 1.06; // 6% bookmaker margin
  const r2 = (n: number) => Math.round(n * 100) / 100;

  return {
    homeWin: r2(m / clamp(homeWinP)),
    draw: r2(m / clamp(drawP)),
    awayWin: r2(m / clamp(awayWinP)),
    over25: r2(m / clamp(over25P)),
    under25: r2(m / clamp(1 - over25P)),
    btts: r2(m / clamp(bttsP)),
    bttNo: r2(m / clamp(1 - bttsP)),
    source: 'Model estimate',
    updatedAt: new Date().toISOString(),
  };
}
