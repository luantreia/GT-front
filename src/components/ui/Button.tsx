import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  loading, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 hover:bg-brand-400',
    secondary: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
    danger: 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100'
  };

  return (
    <button
      className={`rounded-2xl px-6 py-3 text-sm font-semibold transition disabled:opacity-50 active:scale-95 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  );
}
