import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  name: string;
  id?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  id,
  error,
  helperText,
  required = false,
  className = '',
  children
}) => {
  const fieldId = id || `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={fieldId}
        className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between"
      >
        <span>
          {label}
          {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
        </span>
        {required && <span className="text-[10px] text-slate-500 font-normal lowercase">Wajib diisi</span>}
      </label>

      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{
          id?: string;
          name?: string;
          'aria-invalid'?: boolean;
          'aria-describedby'?: string;
          'aria-required'?: boolean;
        }>, {
          id: fieldId,
          name,
          'aria-invalid': !!error,
          'aria-required': required,
          'aria-describedby': [
            error ? errorId : null,
            helperText ? helperId : null
          ].filter(Boolean).join(' ') || undefined
        });
      })}

      {error ? (
        <div id={errorId} className="flex items-center gap-1.5 text-xs text-red-400 mt-0.5 animate-in fade-in" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-slate-500 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(({ className = '', hasError, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm rounded-lg px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
        hasError
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
          : 'border-slate-700 hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'
      } disabled:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(({ className = '', hasError, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full bg-slate-950 border text-slate-100 text-sm rounded-lg px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
        hasError
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
          : 'border-slate-700 hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'
      } disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(({ className = '', hasError, rows = 3, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`w-full bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm rounded-lg px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
        hasError
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
          : 'border-slate-700 hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'
      } disabled:opacity-60 disabled:cursor-not-allowed resize-y ${className}`}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

