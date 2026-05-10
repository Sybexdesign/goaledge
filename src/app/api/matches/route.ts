import { NextRequest, NextResponse } from 'next/server';
import {
  getUpcomingFixtures,
  getLeagueStandingsMap,
  defaultSquad,
  defaultStats,
  LEAGUE_IDS,
} from '@/lib/football-api';
import { getAllMockAnalyses } from '@/data/mock';
import { predictMatch } from '@/lib/prediction';
import { detectValue } from '@/lib/value';
import type { League, MatchAnalysis, BookmakerOdds } from '@/types';

const ALL_LEAGUES = Object.keys(LEAGUE_IDS) as League[];

function stubOdds(): BookmakerOdds {
  return {
    homeWin: 2.10,
    draw: 3.30,
    awayWin: 3.50,
    over25: 1.80,
    under25: 2.00,
    btts: 1.85,
    bttNo: 1.90,
    source: 'Estimated',
    updatedAt: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leagueParam = searchParams.get('league');
  const leagueFilter = leagueParam && leagueParam !== 'all' ? (leagueParam as League) : undefined;

  try {
    const [matches, standingsMaps] = await Promise.all([
      getUpcomingFixtures(leagueFilter),
      Promise.all(ALL_LEAGUES.map(l => getLeagueStandingsMap(l))),
    ]);

    const allStats = new Map<string, ReturnType<typeof defaultStats>>();
    for (const map of standingsMaps) {
      map.forEach((stats, id) => allStats.set(id, stats));
    }

    const squad = defaultSquad();

    const analyses: MatchAnalysis[] = matches.map(match => {
      const homeStats = allStats.get(match.homeTeam.id) ?? defaultStats();
      const awayStats = allStats.get(match.awayTeam.id) ?? defaultStats();
      const odds = stubOdds();
      const prediction = predictMatch(homeStats, awayStats);
      const valueOpportunities = detectValue(prediction, odds);

      return {
        match,
        homeStats,
        awayStats,
        homeSquad: squad,
        awaySquad: squad,
        prediction,
        odds,
        valueOpportunities,
        aiAnalysis: {
          summary: 'Click Analyse to generate AI insights for this match.',
          reasoning: [],
          riskFactors: [],
          valueAssessment: 'Pending AI analysis.',
          recommendation: 'no-bet',
          recommendationText: 'Run analysis to get a recommendation.',
          confidence: 'low',
        },
      };
    });

    return NextResponse.json({ matches: analyses });
  } catch (err) {
    console.error('Football API error, falling back to mock data:', err);
    let analyses = getAllMockAnalyses();
    if (leagueFilter) {
      analyses = analyses.filter(a => a.match.league === leagueFilter);
    }
    return NextResponse.json({ matches: analyses });
  }
}
