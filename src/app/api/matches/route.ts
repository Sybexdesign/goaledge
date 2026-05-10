import { NextRequest, NextResponse } from 'next/server';
import {
  getUpcomingFixtures,
  getLeagueStandingsMap,
  defaultSquad,
  defaultStats,
  LEAGUE_IDS,
} from '@/lib/football-api';
import { predictMatch } from '@/lib/prediction';
import { detectValue } from '@/lib/value';
import { computeMarketOdds } from '@/lib/market-odds';
import { getBestBet } from '@/lib/decision';
import { autoAnalyze } from '@/lib/auto-analysis';
import type { League, MatchAnalysis } from '@/types';

const ALL_LEAGUES = Object.keys(LEAGUE_IDS) as League[];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leagueParam = searchParams.get('league');
  const leagueFilter = leagueParam && leagueParam !== 'all' ? (leagueParam as League) : undefined;

  try {
    const [matches, standingsMaps] = await Promise.all([
      getUpcomingFixtures(leagueFilter),
      Promise.all(ALL_LEAGUES.map(l => getLeagueStandingsMap(l))),
    ]);

    if (matches.length === 0) {
      return NextResponse.json({ matches: [], source: 'live' });
    }

    const allStats = new Map<string, ReturnType<typeof defaultStats>>();
    for (const map of standingsMaps) {
      map.forEach((stats, id) => allStats.set(id, stats));
    }

    const squad = defaultSquad();

    const analyses: MatchAnalysis[] = matches.map(match => {
      const homeStats = allStats.get(match.homeTeam.id) ?? defaultStats();
      const awayStats = allStats.get(match.awayTeam.id) ?? defaultStats();
      const odds = computeMarketOdds(homeStats, awayStats);
      const prediction = predictMatch(homeStats, awayStats);
      const valueOpportunities = detectValue(prediction, odds);
      const decision = getBestBet({ match, homeStats, awayStats, homeSquad: squad, awaySquad: squad, prediction, odds, valueOpportunities, aiAnalysis: { summary: '', reasoning: [], riskFactors: [], valueAssessment: '', recommendation: 'no-bet', recommendationText: '', confidence: 'low' } });
      const aiAnalysis = autoAnalyze(match, homeStats, awayStats, prediction, decision);

      return {
        match,
        homeStats,
        awayStats,
        homeSquad: squad,
        awaySquad: squad,
        prediction,
        odds,
        valueOpportunities,
        aiAnalysis,
      };
    });

    return NextResponse.json({ matches: analyses, source: 'live' });
  } catch (err) {
    console.error('Football API error:', err);
    return NextResponse.json(
      { matches: [], source: 'error', error: 'Live data temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    );
  }
}
