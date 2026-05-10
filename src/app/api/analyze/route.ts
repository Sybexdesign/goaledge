import { NextRequest, NextResponse } from 'next/server';
import { analyzeMatch } from '@/lib/claude';
import { getFixtureById, getLeagueStandingsMap, defaultSquad, defaultStats } from '@/lib/football-api';
import { getMockMatchAnalysis } from '@/data/mock';
import { predictMatch } from '@/lib/prediction';
import type { BookmakerOdds } from '@/types';

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
    const { matchId, useMock } = await req.json();

    // Legacy mock IDs (match-001 etc.) — use mock data
    if (useMock || String(matchId).startsWith('match-')) {
      const analysis = getMockMatchAnalysis(matchId);
      if (!analysis) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

      if (useMock || !process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ analysis: analysis.aiAnalysis });
      }

      const aiAnalysis = await analyzeMatch(
        analysis.match,
        analysis.homeStats,
        analysis.awayStats,
        analysis.homeSquad,
        analysis.awaySquad,
        analysis.prediction,
        analysis.odds
      );
      return NextResponse.json({ analysis: aiAnalysis });
    }

    // Live fixture path
    const match = await getFixtureById(String(matchId));
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    const standingsMap = await getLeagueStandingsMap(match.league);
    const homeStats = standingsMap.get(match.homeTeam.id) ?? defaultStats();
    const awayStats = standingsMap.get(match.awayTeam.id) ?? defaultStats();
    const squad = defaultSquad();
    const prediction = predictMatch(homeStats, awayStats);

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        analysis: {
          summary: `${match.homeTeam.name} vs ${match.awayTeam.name} — live data loaded.`,
          reasoning: [
            `Home xG per game: ${homeStats.xG}`,
            `Away xG per game: ${awayStats.xG}`,
            `Home recent form: ${homeStats.recentForm.join(' ')}`,
            `Away recent form: ${awayStats.recentForm.join(' ')}`,
          ],
          riskFactors: ['Odds are estimated — no bookmaker data feed connected.'],
          valueAssessment: 'Set ANTHROPIC_API_KEY to enable full AI analysis.',
          recommendation: 'no-bet',
          recommendationText: 'Configure Anthropic API key for AI recommendations.',
          confidence: 'low',
        },
      });
    }

    const aiAnalysis = await analyzeMatch(
      match,
      homeStats,
      awayStats,
      squad,
      squad,
      prediction,
      STUB_ODDS
    );

    return NextResponse.json({ analysis: aiAnalysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze match' }, { status: 500 });
  }
}
