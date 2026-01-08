import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: { value: string | number; label: string }[];
}

export function Select({ label, options, children, className = '', ...props }: SelectProps) {
  return (
    <label className="block space-y-1 text-left">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      )}
      <select
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-50 ${className}`}
        {...props}
      >
        {options ? options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )) : children}
      </select>
    </label>
  );
}
