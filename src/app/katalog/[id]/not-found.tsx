import Link from 'next/link';
import { Bot, ArrowLeft } from 'lucide-react';

/**
 * not-found.tsx untuk segmen /katalog/[id].
 *
 * Ditampilkan ketika:
 * 1. Format ID tidak valid (tidak cocok regex /^AGV-\d{2,}$/)
 * 2. Robot dengan ID tersebut tidak ditemukan di database
 */
export default function RobotNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 gap-4">
      <div className="p-4 rounded-full bg-slate-800 border border-slate-700">
        <Bot className="w-8 h-8 text-slate-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Robot Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Unit AGV dengan ID yang diminta tidak terdaftar dalam sistem.
          Pastikan format ID sesuai (contoh: AGV-01, AGV-02).
        </p>
      </div>
      <Link
        href="/katalog"
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Katalog
      </Link>
    </div>
  );
}
