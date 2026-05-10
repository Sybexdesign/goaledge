import { Header } from '@/components/layout/Header';
import { MatchDetail } from '@/components/match/MatchDetail';
import { getFixtureById, getLeagueStandingsMap, defaultSquad, defaultStats } from '@/lib/football-api';
import { getMockMatchAnalysis } from '@/data/mock';
import { predictMatch } from '@/lib/prediction';
import { detectValue } from '@/lib/value';
import { computeMarketOdds } from '@/lib/market-odds';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: { id: string };
}

export default async function MatchPage({ params }: Props) {
  let analysis;

  if (params.id.startsWith('match-')) {
    analysis = getMockMatchAnalysis(params.id);
    if (!analysis) notFound();
  } else {
    try {
      const match = await getFixtureById(params.id);
      if (!match) notFound();

      const standingsMap = await getLeagueStandingsMap(match.league);
      const homeStats = standingsMap.get(match.homeTeam.id) ?? defaultStats();
      const awayStats = standingsMap.get(match.awayTeam.id) ?? defaultStats();
      const squad = defaultSquad();
      const prediction = predictMatch(homeStats, awayStats);
      const odds = computeMarketOdds(homeStats, awayStats);
      const valueOpportunities = detectValue(prediction, odds);

      analysis = {
        match,
        homeStats,
        awayStats,
        homeSquad: squad,
        awaySquad: squad,
        prediction,
        odds,
        valueOpportunities,
        aiAnalysis: {
          summary: 'Click Analyse below to generate AI insights for this match.',
          reasoning: [
            `${match.homeTeam.shortName} xG per game: ${homeStats.xG.toFixed(2)}`,
            `${match.awayTeam.shortName} xG per game: ${awayStats.xG.toFixed(2)}`,
            `${match.homeTeam.shortName} recent form: ${homeStats.recentForm.join(' ')}`,
            `${match.awayTeam.shortName} recent form: ${awayStats.recentForm.join(' ')}`,
          ],
          riskFactors: ['Odds are estimated — no live bookmaker feed connected.'],
          valueAssessment: 'Run AI analysis for a full assessment.',
          recommendation: 'no-bet' as const,
          recommendationText: 'Click Analyse for an AI-powered recommendation.',
          confidence: 'low' as const,
        },
      };
    } catch {
      notFound();
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-6"
        >
          ← Back to Dashboard
        </Link>
        <MatchDetail analysis={analysis!} />
      </main>
    </div>
  );
}
