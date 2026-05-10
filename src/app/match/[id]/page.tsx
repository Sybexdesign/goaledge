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

function ErrorPage({ title, message }: { title: string; message: string }) {
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
        <div className="card text-center py-16 border-[var(--edge-amber)]/20 max-w-md mx-auto mt-8">
          <div className="w-12 h-12 rounded-full bg-[var(--edge-amber)]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[var(--edge-amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="font-display text-base font-bold mb-2">{title}</h1>
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">{message}</p>
          <Link
            href="/"
            className="inline-block mt-6 px-5 py-2 text-sm font-medium rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-4)] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default async function MatchPage({ params }: Props) {
  // Reject obviously invalid IDs immediately
  if (!params.id || !/^\d+$/.test(params.id)) {
    notFound();
  }

  let match: Awaited<ReturnType<typeof getFixtureById>>;
  try {
    match = await getFixtureById(params.id);
  } catch {
    return (
      <ErrorPage
        title="Could not load match"
        message="The football API is temporarily unavailable. Please go back and try clicking the match again in a moment."
      />
    );
  }

  if (!match) notFound();

  try {
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
    return (
      <ErrorPage
        title="Could not load match details"
        message="Match found but league standings are temporarily unavailable. Analysis will be limited. Please try again shortly."
      />
    );
  }
}
