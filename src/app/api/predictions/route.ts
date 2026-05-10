import { NextRequest, NextResponse } from 'next/server';
import { getFixtureById, getLeagueStandingsMap, defaultStats } from '@/lib/football-api';
import { getMockMatchAnalysis } from '@/data/mock';
import { predictMatch } from '@/lib/prediction';
import { detectValue } from '@/lib/value';
import { calculateStake } from '@/lib/bankroll';
import type { BankrollConfig, BookmakerOdds } from '@/types';

const STUB_ODDS: BookmakerOdds = {
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

export async function POST(req: NextRequest) {
  try {
    const { matchId, bankroll } = await req.json();

    const bankrollConfig: BankrollConfig = bankroll ?? {
      total: 500,
      currency: 'GBP',
      maxStakePercent: 0.03,
      kellyFraction: 0.25,
    };

    // Legacy mock IDs (match-001 etc.) — use mock data
    if (String(matchId).startsWith('match-')) {
      const matchData = getMockMatchAnalysis(matchId);
      if (!matchData) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      const prediction = predictMatch(matchData.homeStats, matchData.awayStats);
      const valueOpportunities = detectValue(prediction, matchData.odds);
      const stakes = valueOpportunities.map(opp => ({ ...opp, stake: calculateStake(opp, bankrollConfig) }));
      return NextResponse.json({ prediction, valueOpportunities: stakes });
    }

    // Live fixture path
    const match = await getFixtureById(String(matchId));
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    const standingsMap = await getLeagueStandingsMap(match.league);
    const homeStats = standingsMap.get(match.homeTeam.id) ?? defaultStats();
    const awayStats = standingsMap.get(match.awayTeam.id) ?? defaultStats();

    const prediction = predictMatch(homeStats, awayStats);
    const valueOpportunities = detectValue(prediction, STUB_ODDS);
    const stakes = valueOpportunities.map(opp => ({ ...opp, stake: calculateStake(opp, bankrollConfig) }));

    return NextResponse.json({ prediction, valueOpportunities: stakes });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 500 });
  }
}
