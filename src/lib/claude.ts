import Anthropic from '@anthropic-ai/sdk';
import type { MatchAnalysis, AIAnalysis, TeamStats, SquadSignals, Prediction, BookmakerOdds, Match } from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are GoalEdge, an elite football betting intelligence analyst.

Your task is to analyze structured football match data and identify value opportunities with disciplined reasoning.

RULES — follow these strictly:
1. Never invent missing facts. Only use provided data.
2. Separate probability from confidence. High probability ≠ high confidence.
3. Highlight uncertainty explicitly. If data is thin, say so.
4. If no clear statistical edge exists, recommend NO BET. This is critical.
5. Never recommend large stakes. Maximum suggestion is 3% of bankroll.
6. Identify contradictions between data points (e.g. good form but poor xG).
7. Flag unusual market behaviour if odds movement suggests sharp action.
8. Be concise. Traders don't read essays.

OUTPUT FORMAT — respond in valid JSON only:
{
  "summary": "One-sentence match assessment",
  "reasoning": ["Point 1", "Point 2", "..."],
  "riskFactors": ["Risk 1", "Risk 2"],
  "valueAssessment": "Where value exists or doesn't",
  "recommendation": "bet | small-stake | no-bet | avoid",
  "recommendationText": "Plain English recommendation",
  "confidence": "high | medium | low",
  "contradictions": ["Any conflicting signals"],
  "marketBehaviour": "Notes on odds movement if relevant"
}`;

function buildMatchPrompt(
  match: Match,
  homeStats: TeamStats,
  awayStats: TeamStats,
  homeSquad: SquadSignals,
  awaySquad: SquadSignals,
  prediction: Prediction,
  odds: BookmakerOdds
): string {
  return `
MATCH: ${match.homeTeam.name} vs ${match.awayTeam.name}
LEAGUE: ${match.league}
KICKOFF: ${match.kickoff}

── HOME: ${match.homeTeam.name} ──
Recent form: ${homeStats.recentForm.join(' ')}
Goals scored (last 10): ${homeStats.goalsScored}
Goals conceded (last 10): ${homeStats.goalsConceded}
xG: ${homeStats.xG.toFixed(2)}
xGA: ${homeStats.xGA.toFixed(2)}
Clean sheets: ${homeStats.cleanSheets}
Avg possession: ${homeStats.avgPossession}%
Injuries: ${homeSquad.injuries.length > 0 ? homeSquad.injuries.join(', ') : 'None'}
Suspensions: ${homeSquad.suspensions.length > 0 ? homeSquad.suspensions.join(', ') : 'None'}
Key absences: ${homeSquad.keyAbsences.length > 0 ? homeSquad.keyAbsences.join(', ') : 'None'}
Fixture congestion: ${homeSquad.fixtureCongesion ? 'Yes' : 'No'}

── AWAY: ${match.awayTeam.name} ──
Recent form: ${awayStats.recentForm.join(' ')}
Goals scored (last 10): ${awayStats.goalsScored}
Goals conceded (last 10): ${awayStats.goalsConceded}
xG: ${awayStats.xG.toFixed(2)}
xGA: ${awayStats.xGA.toFixed(2)}
Clean sheets: ${awayStats.cleanSheets}
Avg possession: ${awayStats.avgPossession}%
Injuries: ${awaySquad.injuries.length > 0 ? awaySquad.injuries.join(', ') : 'None'}
Suspensions: ${awaySquad.suspensions.length > 0 ? awaySquad.suspensions.join(', ') : 'None'}
Key absences: ${awaySquad.keyAbsences.length > 0 ? awaySquad.keyAbsences.join(', ') : 'None'}
Fixture congestion: ${awaySquad.fixtureCongesion ? 'Yes' : 'No'}

── MODEL PREDICTIONS ──
Home win: ${(prediction.homeWin * 100).toFixed(1)}%
Draw: ${(prediction.draw * 100).toFixed(1)}%
Away win: ${(prediction.awayWin * 100).toFixed(1)}%
Over 2.5 goals: ${(prediction.over25 * 100).toFixed(1)}%
BTTS: ${(prediction.btts * 100).toFixed(1)}%
Expected goals: ${prediction.expectedGoals.home.toFixed(2)} - ${prediction.expectedGoals.away.toFixed(2)}

── BOOKMAKER ODDS ──
Home: ${odds.homeWin} (implied: ${(1 / odds.homeWin * 100).toFixed(1)}%)
Draw: ${odds.draw} (implied: ${(1 / odds.draw * 100).toFixed(1)}%)
Away: ${odds.awayWin} (implied: ${(1 / odds.awayWin * 100).toFixed(1)}%)
${odds.over25 ? `Over 2.5: ${odds.over25} (implied: ${(1 / odds.over25 * 100).toFixed(1)}%)` : ''}
${odds.btts ? `BTTS: ${odds.btts} (implied: ${(1 / odds.btts * 100).toFixed(1)}%)` : ''}
Source: ${odds.source}

Analyze this match. Identify value or recommend no bet.`;
}

export async function analyzeMatch(
  match: Match,
  homeStats: TeamStats,
  awayStats: TeamStats,
  homeSquad: SquadSignals,
  awaySquad: SquadSignals,
  prediction: Prediction,
  odds: BookmakerOdds
): Promise<AIAnalysis> {
  const prompt = buildMatchPrompt(match, homeStats, awayStats, homeSquad, awaySquad, prediction, odds);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const cleaned = text.replace(/```json|```/g, '').trim();
  const analysis: AIAnalysis = JSON.parse(cleaned);

  return analysis;
}
