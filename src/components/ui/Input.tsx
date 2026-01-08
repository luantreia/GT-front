import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export function Input({ label, icon, className = '', ...props }: InputProps) {
  return (
    <label className="block space-y-1 text-left">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-2xl border border-slate-200 bg-white ${icon ? 'pl-10' : 'px-4'} py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-50 ${className}`}
          {...props}
        />
      </div>
    </label>
  );
}
