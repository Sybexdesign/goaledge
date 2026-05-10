import { Header } from '@/components/layout/Header';
import Link from 'next/link';

export default function MatchNotFound() {
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
        <div className="card text-center py-16 border-dashed max-w-md mx-auto mt-8">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-3)] flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚽
          </div>
          <h1 className="font-display text-base font-bold mb-2">Match not found</h1>
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
            This fixture may have been completed, postponed, or the link is outdated. Head back to the dashboard for today&apos;s matches.
          </p>
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
