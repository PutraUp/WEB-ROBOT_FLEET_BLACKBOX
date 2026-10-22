import { Loader2 } from 'lucide-react';

/**
 * loading.tsx — Berkas khusus App Router.
 *
 * Ditampilkan secara otomatis oleh Next.js saat konten halaman sedang dimuat
 * (menggunakan React Suspense secara internal). Ini adalah Server Component.
 */
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <div className="text-center">
        <p className="text-sm font-semibold text-white">Memuat Data...</p>
        <p className="text-xs text-slate-400 mt-1">Menghubungkan ke sistem pemantauan armada</p>
      </div>
    </div>
  );
}
