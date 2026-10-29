'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Code2,
  HardHat,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { loginSchema, LoginFormData } from '../../lib/validations/auth';
import { useFleet } from '../../context/FleetContext';
import { UserRole } from '../../types';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { loginUser, setCurrentPage } = useFleet();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'OPERATOR',
    rememberMe: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<LoginFormData | null>(null);
  const [showZodInspector, setShowZodInspector] = useState(false);
  const [rawZodErrors, setRawZodErrors] = useState<string | null>(null);

  // Validate entire form with Zod
  const validateForm = (data: LoginFormData): boolean => {
    const parseResult = loginSchema.safeParse(data);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setRawZodErrors(JSON.stringify(parseResult.error.issues, null, 2));
      return false;
    }

    setErrors({});
    setRawZodErrors(null);
    return true;
  };

  // Validate a single field on change if touched
  const validateField = (field: keyof LoginFormData, value: unknown) => {
    // Extract single field schema from Zod object
    const fieldSchema = loginSchema.shape[field];
    if (!fieldSchema) return;

    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({
        ...prev,
        [field]: result.error.issues[0]?.message || 'Input tidak valid'
      }));
    } else {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleChange = (field: keyof LoginFormData, value: unknown) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, role: true });

    const isValid = validateForm(formData);
    if (!isValid) return;

    setIsSubmitting(true);

    // Simulate HMAC token verification and login handshake
    setTimeout(() => {
      setIsSubmitting(false);
      setLoginSuccess(formData);

      // Extract username from email
      const username = formData.email.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = username
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      loginUser({
        email: formData.email,
        name: formattedName || 'Petugas AGV',
        role: formData.role,
        loginTime: new Date().toLocaleTimeString('id-ID')
      });
    }, 750);
  };

  // Preset demo credentials for easy testing
  const applyPreset = (role: UserRole, email: string, pass: string) => {
    const presetData: LoginFormData = {
      email,
      password: pass,
      role,
      rememberMe: true
    };
    setFormData(presetData);
    setTouched({ email: true, password: true, role: true });
    validateForm(presetData);
  };

  const triggerInvalidDemo = () => {
    const badData: LoginFormData = {
      email: 'format-email-salah',
      password: '123',
      role: 'OPERATOR',
      rememberMe: false
    };
    setFormData(badData);
    setTouched({ email: true, password: true, role: true });
    validateForm(badData);
  };

  const handleReset = () => {
    setFormData({
      email: '',
      password: '',
      role: 'OPERATOR',
      rememberMe: false
    });
    setErrors({});
    setTouched({});
    setLoginSuccess(null);
    setRawZodErrors(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30 shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider font-semibold">
                Form Validation Engine: Zod v3
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Type-Safe Schema
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5 tracking-tight">
              Autentikasi Akses Sistem Black Box
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Masuk dengan kredensial terverifikasi untuk mengelola armada robot AGV, log HMAC-SHA256, atau investigasi forensik.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {loginSuccess && (
        <Alert
          variant="success"
          title="Autentikasi Berhasil Terverifikasi!"
          className="border-emerald-500/40 bg-emerald-950/30"
        >
          <div className="space-y-2 mt-1">
            <p className="text-slate-200 text-sm">
              Sesi login aktif sebagai <strong className="text-white">{loginSuccess.email}</strong> dengan peran hak akses{' '}
              <span className="font-mono font-bold text-emerald-400 uppercase">[{loginSuccess.role}]</span>.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCurrentPage('fleet');
                  router.push('/');
                }}
              >
                Buka Armada AGV
              </Button>
              {loginSuccess.role === 'ADMIN' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage('admin');
                    router.push('/admin');
                  }}
                >
                  Panel Admin & Audit
                </Button>
              )}
              {loginSuccess.role === 'FORENSIC' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage('forensics');
                    router.push('/forensics');
                  }}
                >
                  Investigasi Forensik
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentPage('logs');
                  router.push('/logs');
                }}
              >
                Black Box Logs
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Main Login Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                Alamat Email Pengguna
                <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Format: user@domain.id</span>
            </label>
            <div className="relative">
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="nama.petugas@pertamina-fleet.ac.id"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20 bg-red-950/10'
                    : touched.email && !errors.email && formData.email
                    ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
                    : 'border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20'
                }`}
              />
              {touched.email && !errors.email && formData.email && (
                <div className="absolute right-3.5 top-3.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                </div>
              )}
            </div>
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium animate-in fade-in"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Role Select Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-role"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                Peran Akses (RBAC Role)
                <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">z.enum</span>
            </label>
            <select
              id="login-role"
              name="role"
              value={formData.role}
              onChange={e => handleChange('role', e.target.value as UserRole)}
              onBlur={() => handleBlur('role')}
              aria-invalid={!!errors.role}
              className={`w-full bg-slate-950 border text-slate-100 text-sm rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                errors.role
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20'
              }`}
            >
              <option value="OPERATOR">Operator Gudang (Kendali AGV & Pemantauan)</option>
              <option value="FORENSIC">Penyelidik Forensik (Audit & Hash-Chain HMAC)</option>
              <option value="ADMIN">Administrator Sistem (Hak Akses Penuh & Registrasi)</option>
            </select>
            {errors.role && (
              <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.role}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                Kata Sandi Kredensial
                <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Min. 6 karakter</span>
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`w-full bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-3 pr-11 transition-all focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20 bg-red-950/10'
                    : touched.password && !errors.password && formData.password.length >= 6
                    ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
                    : 'border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium animate-in fade-in"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Remember Me & Terminal Info */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={e => handleChange('rememberMe', e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500/30"
              />
              <span className="text-xs text-slate-300">Ingat sesi pada terminal ini</span>
            </label>
            <span className="text-[11px] font-mono text-cyan-400/80">HMAC-SHA256 Protected</span>
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            <Button
              type="submit"
              variant="cyber"
              isLoading={isSubmitting}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full sm:flex-1 py-3"
            >
              Masuk & Verifikasi Kredensial
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Reset Form
            </Button>
          </div>
        </form>

        {/* Quick Demo Pre-fill section */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Demo Cepat: Uji Form Validation
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Klik untuk auto-fill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => applyPreset('OPERATOR', 'danu.operator@fleet.pertamina.id', 'operator#2026')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 hover:border-emerald-500/40 text-left transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <HardHat className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate">Akun Operator</span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">operator#2026</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('FORENSIC', 'clara.forensik@fleet.pertamina.id', 'forensic#sec2026')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 hover:border-cyan-500/40 text-left transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate">Akun Forensik</span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">forensic#sec2026</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('ADMIN', 'root.admin@fleet.pertamina.id', 'admin#super2026')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 hover:border-purple-500/40 text-left transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate">Akun Admin</span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">admin#super2026</span>
              </div>
            </button>
          </div>

          {/* Trigger validation failure button */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={triggerInvalidDemo}
              className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 hover:bg-red-950/40 hover:border-red-500/50 flex items-center justify-center gap-2 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Uji Simulasi Galat Validasi Zod (Email Format Salah & Password Terlalu Pendek)
            </button>
          </div>
        </div>

        {/* Zod Technical Inspector (Toggleable) */}
        <div className="pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowZodInspector(!showZodInspector)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-mono">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Inspeksi Implementasi Skema Zod (Source Code & Validasi Raw)
            </span>
            <span className="text-[11px] underline font-semibold text-cyan-400">
              {showZodInspector ? 'Sembunyikan' : 'Tampilkan Kode'}
            </span>
          </button>

          {showZodInspector && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div>
                <p className="text-cyan-400 font-bold mb-1"># Definisi Skema Zod (src/lib/validations/auth.ts):</p>
                <pre className="text-[11px] text-slate-400 bg-slate-900/90 p-3 rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
{`export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Alamat email wajib diisi.' })
    .email({ message: 'Format alamat email tidak valid (contoh: operator@fleet.id).' }),
  password: z
    .string()
    .min(1, { message: 'Kata sandi wajib diisi.' })
    .min(6, { message: 'Kata sandi minimal harus terdiri dari 6 karakter.' })
    .max(50, { message: 'Kata sandi tidak boleh melebihi 50 karakter.' }),
  role: z.enum(['OPERATOR', 'FORENSIC', 'ADMIN'], {
    message: 'Silakan pilih peran pengguna yang valid.'
  }),
  rememberMe: z.boolean().default(false)
});`}
                </pre>
              </div>

              <div>
                <p className="text-cyan-400 font-bold mb-1"># Status Eksekusi loginSchema.safeParse():</p>
                {rawZodErrors ? (
                  <div className="text-[11px] text-red-400 bg-red-950/20 p-2.5 rounded-lg border border-red-900/50">
                    <p className="font-bold mb-1">status: INVALID ({Object.keys(errors).length} issues ditemukan)</p>
                    <pre className="overflow-x-auto text-[10px] text-red-300">{rawZodErrors}</pre>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/50">
                    status: VALID (0 errors) — Data siap diproses.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
