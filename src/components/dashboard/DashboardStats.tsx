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
      sub: 'tracked this season',
      color: 'var(--text-primary)',
      accent: 'var(--edge-blue)',
    },
    {
      label: 'Win Rate',
      value: `${(stats.winRate * 100).toFixed(1)}%`,
      sub: `${Math.round(stats.totalBets * stats.winRate)}W · ${Math.round(stats.totalBets * (1 - stats.winRate))}L`,
      color: stats.winRate > 0.5 ? 'var(--edge-green)' : stats.winRate > 0 ? 'var(--edge-amber)' : 'var(--text-muted)',
      accent: stats.winRate > 0.5 ? 'var(--edge-green)' : 'var(--edge-amber)',
    },
    {
      label: 'ROI',
      value: `${stats.roi > 0 ? '+' : ''}${(stats.roi * 100).toFixed(1)}%`,
      sub: 'return on investment',
      color: stats.roi > 0 ? 'var(--edge-green)' : stats.roi < 0 ? 'var(--edge-red)' : 'var(--text-muted)',
      accent: stats.roi > 0 ? 'var(--edge-green)' : stats.roi < 0 ? 'var(--edge-red)' : 'var(--surface-5)',
    },
    {
      label: 'Net Profit',
      value: `${stats.profit > 0 ? '+' : ''}£${Math.abs(stats.profit).toFixed(2)}`,
      sub: stats.profit >= 0 ? 'in profit' : 'in loss',
      color: stats.profit > 0 ? 'var(--edge-green)' : stats.profit < 0 ? 'var(--edge-red)' : 'var(--text-muted)',
      accent: stats.profit > 0 ? 'var(--edge-green)' : stats.profit < 0 ? 'var(--edge-red)' : 'var(--surface-5)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statCards.map((stat, i) => (
        <div
          key={stat.label}
          className={`card animate-slide-up stagger-${i + 1} overflow-hidden relative`}
        >
          {/* Colored top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[var(--radius-lg)]"
            style={{ background: stat.accent }}
          />
          <div className="label-xs mb-2">{stat.label}</div>
          <div className="font-display text-2xl font-bold leading-none" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1.5">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
