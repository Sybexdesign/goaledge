import type { Match, TeamStats, Prediction, AIAnalysis } from '@/types';
import type { BetDecision } from './decision';

function formStr(form: string[]) {
  return form.slice(0, 5).join('');
}

function formPoints(form: string[]) {
  return form.slice(0, 5).reduce((n, r) => n + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
}

function formLabel(pts: number): string {
  if (pts >= 12) return 'in excellent form';
  if (pts >= 9) return 'in good form';
  if (pts >= 6) return 'in mixed form';
  if (pts >= 3) return 'in poor form';
  return 'in very poor form';
}

function attackDesc(xG: number): string {
  if (xG >= 2.2) return 'highly potent attack';
  if (xG >= 1.7) return 'strong attack';
  if (xG >= 1.3) return 'average attack';
  return 'weak attack';
}

function defDesc(xGA: number): string {
  if (xGA <= 0.8) return 'solid defence';
  if (xGA <= 1.2) return 'decent defence';
  if (xGA <= 1.6) return 'leaky defence';
  return 'very poor defence';
}

/**
 * Automatically generates a stat-driven AI analysis for any match,
 * replacing all "Click Analyse" placeholders with real data.
 */
export function autoAnalyze(
  match: Match,
  homeStats: TeamStats,
  awayStats: TeamStats,
  prediction: Prediction,
  decision: BetDecision,
): AIAnalysis {
  const h = match.homeTeam.shortName;
  const a = match.awayTeam.shortName;
  const hPts = formPoints(homeStats.recentForm);
  const aPts = formPoints(awayStats.recentForm);
  const totalXG = (prediction.expectedGoals.home + prediction.expectedGoals.away).toFixed(2);

  // ── Summary ──────────────────────────────────────────────
  const favourite = prediction.homeWin > prediction.awayWin
    ? `${h} are the slight favourites`
    : prediction.awayWin > prediction.homeWin
      ? `${a} are the slight favourites`
      : 'The match is evenly poised';

  const goalContext = prediction.over25 >= 0.60
    ? `Combined xG of ${totalXG} points to an open, goal-rich contest.`
    : prediction.over25 <= 0.40
      ? `Combined xG of ${totalXG} suggests a tight, low-scoring affair.`
      : `Combined xG of ${totalXG} leaves the scoring outcome finely balanced.`;

  const decisionSummary = decision.action === 'bet'
    ? ` The model identifies a clear edge on ${decision.market} (${decision.confidence}% confidence, +${decision.edgePct ?? 0}% above market price).`
    : decision.action === 'small-stake'
      ? ` There is a marginal edge on ${decision.market} (${decision.confidence}% confidence), warranting a cautious stake.`
      : ' No clear market edge was detected — the model recommends avoiding this match.';

  const summary = `${favourite} at home. ${goalContext}${decisionSummary}`;

  // ── Reasoning ────────────────────────────────────────────
  const reasoning: string[] = [
    `${h}: ${attackDesc(homeStats.xG)} (${homeStats.xG.toFixed(2)} xG/game) vs ${defDesc(awayStats.xGA)} — ${awayStats.xGA.toFixed(2)} xGA/game conceded by ${a}.`,
    `${a}: ${attackDesc(awayStats.xG)} (${awayStats.xG.toFixed(2)} xG/game) vs ${defDesc(homeStats.xGA)} — ${homeStats.xGA.toFixed(2)} xGA/game conceded by ${h}.`,
    `Recent form: ${h} ${formLabel(hPts)} (${formStr(homeStats.recentForm)}, ${hPts}/15 pts). ${a} ${formLabel(aPts)} (${formStr(awayStats.recentForm)}, ${aPts}/15 pts).`,
    `Model probabilities — ${h} win: ${(prediction.homeWin * 100).toFixed(0)}% · Draw: ${(prediction.draw * 100).toFixed(0)}% · ${a} win: ${(prediction.awayWin * 100).toFixed(0)}%.`,
    `Goals markets — Over 2.5: ${(prediction.over25 * 100).toFixed(0)}% · BTTS: ${(prediction.btts * 100).toFixed(0)}%.`,
  ];

  // ── Risk factors ─────────────────────────────────────────
  const riskFactors: string[] = [];

  if (Math.abs(prediction.homeWin - prediction.awayWin) < 0.1) {
    riskFactors.push('Closely matched sides — small data differences carry high uncertainty.');
  }
  if (prediction.draw > 0.28) {
    riskFactors.push(`High draw probability (${(prediction.draw * 100).toFixed(0)}%) elevates risk on outright win markets.`);
  }
  if (decision.action === 'no-bet' || (decision.edgePct ?? 0) < 4) {
    riskFactors.push('Model edge is thin — market pricing is efficient for this fixture.');
  }
  if (homeStats.xGA > 1.5 && awayStats.xGA > 1.5) {
    riskFactors.push('Both defences are below average — actual goals could deviate significantly from xG.');
  }
  riskFactors.push('Odds shown are model estimates. Verify current bookmaker prices before placing.');

  // ── Value assessment ─────────────────────────────────────
  let valueAssessment: string;
  if (decision.action === 'bet') {
    valueAssessment = `Strong value on ${decision.market} at ${decision.odds?.toFixed(2) ?? '—'}. Model prices this ${(decision.edgePct ?? 0) + (decision.odds ? Math.round(100 / decision.odds) : 0)}% implied vs market ${decision.odds ? (100 / decision.odds).toFixed(0) : '—'}%. Edge: +${decision.edgePct ?? 0}%.`;
  } else if (decision.action === 'small-stake') {
    valueAssessment = `Marginal value on ${decision.market}. Edge of +${decision.edgePct ?? 0}% does not clear the high-confidence bar — small stake only.`;
  } else {
    valueAssessment = 'No markets clear the minimum edge threshold. Market pricing is efficient — sit this one out.';
  }

  // ── Recommendation mapping ────────────────────────────────
  const recommendation =
    decision.action === 'bet' ? 'bet' :
    decision.action === 'small-stake' ? 'small-stake' :
    'no-bet';

  const recommendationText =
    decision.action === 'bet'
      ? `Bet ${decision.market}${decision.odds ? ` @ ${decision.odds.toFixed(2)}` : ''}. Model confidence: ${decision.confidence}%. Keep stake within your Kelly-calculated limit.`
      : decision.action === 'small-stake'
        ? `Cautious micro-stake on ${decision.market} only. Edge is real but thin — size down and ensure odds match or exceed ${decision.odds?.toFixed(2) ?? 'market price'}.`
        : 'No bet. The model finds no edge in this fixture at current market pricing.';

  const confidence: AIAnalysis['confidence'] =
    decision.confidence >= 75 ? 'high' :
    decision.confidence >= 62 ? 'medium' :
    'low';

  return {
    summary,
    reasoning,
    riskFactors,
    valueAssessment,
    recommendation,
    recommendationText,
    confidence,
  };
}
