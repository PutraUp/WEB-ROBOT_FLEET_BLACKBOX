import { Loader2, Hash } from 'lucide-react';

/**
 * loading.tsx untuk segmen /katalog/[id].
 * Ditampilkan saat halaman detail robot sedang dimuat.
 */
export default function RobotDetailLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="relative">
        <Hash className="w-10 h-10 text-cyan-400/30" />
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin absolute -top-1 -right-1" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">Memuat Detail Robot...</p>
        <p className="text-xs text-slate-400 mt-1">Mengambil spesifikasi dan log rantai hash</p>
      </div>
    </div>
  );
}
