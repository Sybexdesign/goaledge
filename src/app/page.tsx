import { Header } from '@/components/layout/Header';
import { ValueOpportunities } from '@/components/dashboard/ValueOpportunities';
import { MatchList } from '@/components/dashboard/MatchList';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { BankrollChart } from '@/components/dashboard/BankrollChart';
import { getAllMockAnalyses, mockDashboardStats } from '@/data/mock';

export default function Home() {
  const analyses = getAllMockAnalyses();
  const valueMatches = analyses.filter((a) => a.valueOpportunities.length > 0);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats row */}
        <DashboardStats stats={mockDashboardStats} />

        {/* Value opportunities */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                Today&apos;s Value
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Opportunities where model probability exceeds market pricing
              </p>
            </div>
            <span className="badge badge-green">
              {valueMatches.length} found
            </span>
          </div>
          <ValueOpportunities analyses={valueMatches} />
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold tracking-tight">
                All Matches
              </h2>
              <div className="flex gap-2">
                {['All', 'PL', 'La Liga', 'Serie A'].map((filter) => (
                  <button
                    key={filter}
                    className="px-3 py-1 text-xs font-medium rounded-full transition-colors
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      hover:bg-[var(--surface-3)] first:bg-[var(--surface-3)] first:text-[var(--text-primary)]"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <MatchList analyses={analyses} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BankrollChart data={mockDashboardStats.bankrollHistory} />

            {/* Discipline score */}
            <div className="card">
              <h3 className="font-display text-sm font-bold mb-3 text-[var(--text-secondary)]">
                Discipline Score
              </h3>
              <div className="flex items-end gap-3">
                <span className="font-display text-4xl font-bold text-[var(--edge-green)]">
                  {mockDashboardStats.disciplineScore}
                </span>
                <span className="text-sm text-[var(--text-muted)] mb-1">/100</span>
              </div>
              <div className="prob-bar mt-3">
                <div
                  className="prob-bar-fill"
                  style={{
                    width: `${mockDashboardStats.disciplineScore}%`,
                    background: mockDashboardStats.disciplineScore > 70
                      ? 'var(--edge-green)'
                      : mockDashboardStats.disciplineScore > 40
                        ? 'var(--edge-amber)'
                        : 'var(--edge-red)',
                  }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Based on stake sizing, advice adherence, and betting frequency.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
