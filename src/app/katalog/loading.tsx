import { Loader2, Bot } from 'lucide-react';

/**
 * loading.tsx untuk segmen /katalog.
 * Ditampilkan saat halaman katalog robot sedang dimuat.
 */
export default function KatalogLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="relative">
        <Bot className="w-10 h-10 text-cyan-400/30" />
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin absolute -top-1 -right-1" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">Memuat Katalog Robot...</p>
        <p className="text-xs text-slate-400 mt-1">Mengambil data spesifikasi armada AGV</p>
      </div>
    </div>
  );
}
