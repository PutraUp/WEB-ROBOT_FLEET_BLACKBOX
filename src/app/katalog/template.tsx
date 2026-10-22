'use client';

import React, { useState, useEffect } from 'react';

/**
 * template.tsx — Berkas khusus App Router untuk segmen /katalog.
 *
 * Berbeda dengan `layout.tsx` yang mempertahankan state saat navigasi
 * antar halaman anak, `template.tsx` akan **di-mount ulang (remount)**
 * setiap kali pengguna berpindah halaman di dalam segmen /katalog.
 *
 * Demonstrasi:
 * - Counter di bawah akan di-reset setiap kali pindah dari /katalog ke /katalog/[id]
 *   atau sebaliknya (karena template di-remount).
 * - Timestamp mount juga akan berubah setiap navigasi.
 */
export default function KatalogTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mountCount, setMountCount] = useState(0);
  const [mountTime, setMountTime] = useState('');

  // Effect ini berjalan setiap kali template di-mount ulang
  useEffect(() => {
    setMountCount(prev => prev + 1);
    setMountTime(new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Template Banner — menunjukkan remount behavior */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-400">
            <strong className="text-white">Template /katalog</strong> — Komponen ini di-<em>remount</em> saat navigasi
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono">
          <span>Mount ke-<strong className="text-cyan-400">{mountCount}</strong></span>
          <span>•</span>
          <span>Waktu: <strong className="text-white">{mountTime || '...'}</strong></span>
        </div>
      </div>

      {/* Konten halaman anak */}
      {children}
    </div>
  );
}
