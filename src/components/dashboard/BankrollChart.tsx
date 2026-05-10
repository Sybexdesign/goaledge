'use client';

interface Props {
  data: { date: string; value: number }[];
}

export function BankrollChart({ data }: Props) {
  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const range = max - min || 1;
  const height = 120;
  const width = 280;

  // Generate SVG path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * height * 0.8 - height * 0.1;
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const latest = data[data.length - 1];
  const first = data[0];
  const change = latest.value - first.value;
  const isUp = change >= 0;

  return (
    <div className="card">
      <h3 className="font-display text-sm font-bold mb-1 text-[var(--text-secondary)]">
        Bankroll History
      </h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-display text-2xl font-bold">£{latest.value.toFixed(0)}</span>
        <span className={`text-xs font-mono font-bold ${isUp ? 'text-[var(--edge-green)]' : 'text-[var(--edge-red)]'}`}>
          {isUp ? '+' : ''}{change.toFixed(0)} ({((change / first.value) * 100).toFixed(1)}%)
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bankrollGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isUp ? 'var(--edge-green)' : 'var(--edge-red)'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isUp ? 'var(--edge-green)' : 'var(--edge-red)'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#bankrollGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke={isUp ? 'var(--edge-green)' : 'var(--edge-red)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Latest point */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill={isUp ? 'var(--edge-green)' : 'var(--edge-red)'}
        />
      </svg>

      <div className="flex justify-between mt-2 text-[10px] text-[var(--text-muted)] font-mono">
        <span>{new Date(data[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        <span>{new Date(latest.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
}
