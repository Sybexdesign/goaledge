import { NextResponse } from 'next/server';
import { getUpcomingFixtures, getLeagueStandingsMap, defaultStats, LEAGUE_IDS } from '@/lib/football-api';
import { predictMatch } from '@/lib/prediction';
import { detectValue } from '@/lib/value';
import { computeMarketOdds } from '@/lib/market-odds';
import { getBestBet } from '@/lib/decision';
import { sendPicksAlert } from '@/lib/email';
import type { League, MatchAnalysis } from '@/types';

const ALL_LEAGUES = Object.keys(LEAGUE_IDS) as League[];

export async function POST() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  try {
    const [matches, standingsMaps] = await Promise.all([
      getUpcomingFixtures(),
      Promise.all(ALL_LEAGUES.map(l => getLeagueStandingsMap(l))),
    ]);

    const allStats = new Map<string, ReturnType<typeof defaultStats>>();
    for (const map of standingsMaps) {
      map.forEach((stats, id) => allStats.set(id, stats));
    }

    const analyses: MatchAnalysis[] = matches.map(match => {
      const homeStats = allStats.get(match.homeTeam.id) ?? defaultStats();
      const awayStats = allStats.get(match.awayTeam.id) ?? defaultStats();
      const odds = computeMarketOdds(homeStats, awayStats);
      const prediction = predictMatch(homeStats, awayStats);
      const valueOpportunities = detectValue(prediction, odds);
      return {
        match, homeStats, awayStats,
        homeSquad: { injuries: [], suspensions: [], keyAbsences: [], fixtureCongesion: false },
        awaySquad: { injuries: [], suspensions: [], keyAbsences: [], fixtureCongesion: false },
        prediction, odds, valueOpportunities,
        aiAnalysis: { summary: '', reasoning: [], riskFactors: [], valueAssessment: '', recommendation: 'no-bet', recommendationText: '', confidence: 'low' },
      };
    });

    const picks = analyses
      .map(a => ({ analysis: a, decision: getBestBet(a) }))
      .filter(({ decision }) => decision.action !== 'no-bet' && decision.confidence >= 62)
      .sort((a, b) => b.decision.confidence - a.decision.confidence);

    const emailData = picks.map(({ analysis, decision }) => ({
      homeTeam: analysis.match.homeTeam.name,
      awayTeam: analysis.match.awayTeam.name,
      league: analysis.match.league,
      kickoff: analysis.match.kickoff,
      market: decision.market ?? '',
      odds: decision.odds,
      confidence: decision.confidence,
      edgePct: decision.edgePct,
      reason: decision.reason,
    }));

    await sendPicksAlert(emailData, 'sybexdesigns@gmail.com');

    return NextResponse.json({ sent: true, picks: picks.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
