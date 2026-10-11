import React from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  className = '',
  icon
}) => {
  const variantStyles = {
    success: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/50',
    danger: 'bg-rose-950/70 text-rose-400 border-rose-700/50',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    info: 'bg-cyan-950/70 text-cyan-400 border-cyan-700/50',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-700/50',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const pulseColors = {
    success: 'bg-emerald-400',
    danger: 'bg-rose-400',
    warning: 'bg-amber-400',
    info: 'bg-cyan-400',
    purple: 'bg-purple-400',
    neutral: 'bg-slate-400'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColors[variant]}`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${pulseColors[variant]}`}
          ></span>
        </span>
      )}
      {icon && <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

