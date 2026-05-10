'use client';

import type { UserDashboardStats } from '@/types';

interface Props {
  stats: UserDashboardStats;
}

export function DashboardStats({ stats }: Props) {
  const statCards = [
    {
      label: 'Total Bets',
      value: stats.totalBets.toString(),
      sub: 'tracked',
      color: 'var(--text-primary)',
    },
    {
      label: 'Win Rate',
      value: `${(stats.winRate * 100).toFixed(1)}%`,
      sub: `${Math.round(stats.totalBets * stats.winRate)}W / ${Math.round(stats.totalBets * (1 - stats.winRate))}L`,
      color: stats.winRate > 0.5 ? 'var(--edge-green)' : 'var(--edge-red)',
    },
    {
      label: 'ROI',
      value: `${stats.roi > 0 ? '+' : ''}${(stats.roi * 100).toFixed(1)}%`,
      sub: 'return on investment',
      color: stats.roi > 0 ? 'var(--edge-green)' : 'var(--edge-red)',
    },
    {
      label: 'Profit',
      value: `${stats.profit > 0 ? '+' : ''}£${stats.profit.toFixed(2)}`,
      sub: 'net P&L',
      color: stats.profit > 0 ? 'var(--edge-green)' : 'var(--edge-red)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statCards.map((stat, i) => (
        <div key={stat.label} className={`card animate-slide-up stagger-${i + 1}`}>
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1">{stat.label}</div>
          <div className="font-display text-2xl font-bold" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
