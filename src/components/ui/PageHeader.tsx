import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 rounded-surface bg-white/80 p-6 shadow-surface sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-3">
        {badge && (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            {badge}
          </span>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-600">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </header>
  );
}
