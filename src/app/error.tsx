'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * error.tsx — Error Boundary (Client Component).
 *
 * Berkas khusus App Router yang WAJIB menggunakan `"use client"`
 * karena error boundary di React memerlukan state dan lifecycle hooks.
 * Ditampilkan otomatis saat terjadi error pada rendering halaman.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke layanan pelaporan
    console.error('[Robot Fleet Black Box] Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
      <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30">
        <AlertTriangle className="w-8 h-8 text-rose-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Terjadi Kesalahan Sistem</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Modul pemantauan mengalami kegagalan yang tidak terduga.
          Silakan coba muat ulang halaman ini.
        </p>
        {error.message && (
          <p className="text-xs text-rose-400 font-mono mt-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
            {error.message}
          </p>
        )}
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Coba Muat Ulang
      </button>
    </div>
  );
}
