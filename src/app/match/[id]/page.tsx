import { Header } from '@/components/layout/Header';
import { MatchDetail } from '@/components/match/MatchDetail';
import { getFixtureById, getLeagueStandingsMap, defaultSquad, defaultStats } from '@/lib/football-api';
import { predictMatch } from '@/lib/prediction';
import { detectValue } from '@/lib/value';
import { computeMarketOdds } from '@/lib/market-odds';
import { getBestBet } from '@/lib/decision';
import { autoAnalyze } from '@/lib/auto-analysis';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: { id: string };
}

export default async function MatchPage({ params }: Props) {
  try {
    const match = await getFixtureById(params.id);
    if (!match) notFound();

    const standingsMap = await getLeagueStandingsMap(match!.league);
    const homeStats = standingsMap.get(match!.homeTeam.id) ?? defaultStats();
    const awayStats = standingsMap.get(match!.awayTeam.id) ?? defaultStats();
    const squad = defaultSquad();
    const prediction = predictMatch(homeStats, awayStats);
    const odds = computeMarketOdds(homeStats, awayStats);
    const valueOpportunities = detectValue(prediction, odds);

    const stubAnalysis = { match: match!, homeStats, awayStats, homeSquad: squad, awaySquad: squad, prediction, odds, valueOpportunities, aiAnalysis: { summary: '', reasoning: [], riskFactors: [], valueAssessment: '', recommendation: 'no-bet' as const, recommendationText: '', confidence: 'low' as const } };
    const decision = getBestBet(stubAnalysis);
    const aiAnalysis = autoAnalyze(match!, homeStats, awayStats, prediction, decision);

    const analysis = { ...stubAnalysis, aiAnalysis };

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
          <MatchDetail analysis={analysis} />
        </main>
      </div>
    );
  } catch {
    notFound();
  }
}
