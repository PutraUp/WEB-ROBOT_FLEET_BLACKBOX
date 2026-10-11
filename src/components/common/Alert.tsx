import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = ''
}) => {
  const styles = {
    info: {
      container: 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200',
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" aria-hidden="true" />,
      titleColor: 'text-cyan-300'
    },
    warning: {
      container: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />,
      titleColor: 'text-amber-300'
    },
    danger: {
      container: 'bg-red-950/40 border-red-800/60 text-red-200',
      icon: <XCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />,
      titleColor: 'text-red-300'
    },
    success: {
      container: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />,
      titleColor: 'text-emerald-300'
    }
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border ${current.container} ${className}`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 text-sm">
        {title && <h4 className={`font-semibold mb-0.5 ${current.titleColor}`}>{title}</h4>}
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800/50 transition-colors"
          aria-label="Tutup pemberitahuan"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

