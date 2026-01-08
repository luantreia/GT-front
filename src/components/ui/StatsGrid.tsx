import React from 'react';

interface StatItem {
  label: string;
  value: string | number;
  description?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  className?: string;
}

export function StatsGrid({ stats, className = '' }: StatsGridProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-3 ${className}`}>
      {stats.map((item) => (
        <article key={item.label} className="rounded-2xl bg-white p-4 shadow-card border border-slate-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          {item.description && (
            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
          )}
        </article>
      ))}
    </div>
  );
}
