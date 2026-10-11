import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-200 ${
        glow ? 'shadow-lg shadow-cyan-950/20 border-cyan-500/20' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-4 sm:p-5 border-b border-slate-800/80 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3 className={`text-base font-semibold text-white tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-xs text-slate-400 mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`p-4 sm:p-5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  accentColor = 'cyan'
}) => {
  const accentBorder = {
    cyan: 'border-l-cyan-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    purple: 'border-l-purple-500'
  };

  const iconBg = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    rose: 'bg-rose-500/10 text-rose-400',
    purple: 'bg-purple-500/10 text-purple-400'
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 border-l-4 ${accentBorder[accentColor]} rounded-xl p-4 sm:p-5 transition-transform hover:-translate-y-0.5 duration-200 shadow-sm`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
            {label}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {value}
            </span>
            {subValue && <span className="text-xs text-slate-400">{subValue}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${iconBg[accentColor]} shrink-0`} aria-hidden="true">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-xs">
          <span className={trend.positive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
            {trend.value}
          </span>
          <span className="text-slate-500">dibandingkan sesi sebelumnya</span>
        </div>
      )}
    </div>
  );
};

