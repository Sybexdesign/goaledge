import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoalEdge — AI Football Intelligence',
  description: 'AI-assisted football decision platform. Value detection, risk analysis, bankroll management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
