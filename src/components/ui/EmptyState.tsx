import React from 'react';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ message, description, icon, action }: EmptyStateProps) {
  return (
    <div className="rounded-surface bg-white px-6 py-12 text-center shadow-surface">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-slate-900">{message}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
