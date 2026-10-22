'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * error.tsx untuk segmen /katalog — Client Component.
 */
export default function KatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Katalog] Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
      <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30">
        <AlertTriangle className="w-8 h-8 text-rose-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Gagal Memuat Katalog</h2>
        <p className="text-sm text-slate-400">
          Tidak dapat mengambil data katalog robot. Silakan coba lagi.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Coba Lagi
      </button>
    </div>
  );
}
