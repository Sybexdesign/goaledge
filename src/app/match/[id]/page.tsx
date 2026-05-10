import { Header } from '@/components/layout/Header';
import { MatchDetail } from '@/components/match/MatchDetail';
import { getMockMatchAnalysis } from '@/data/mock';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function MatchPage({ params }: Props) {
  const analysis = getMockMatchAnalysis(params.id);

  if (!analysis) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <MatchDetail analysis={analysis} />
      </main>
    </div>
  );
}
