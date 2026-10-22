import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-slate-400 mb-6">Halaman yang Anda tuju tidak tersedia.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
