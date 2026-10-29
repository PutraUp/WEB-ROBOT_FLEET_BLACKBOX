import React from 'react';
import { notFound } from 'next/navigation';
import { getRobotById, getAllRobotIds, getLogsByRobotId, cariItem, daftarItem } from '../../../lib/data';
import { Battery, MapPin, Gauge, Package, Clock, Hash, ArrowLeft, Shield, CheckCircle, XCircle, Tag } from 'lucide-react';
import Link from 'next/link';

/**
 * generateStaticParams — Membuat daftar parameter statis untuk pre-rendering.
 * Next.js akan memanggil fungsi ini saat build untuk mengetahui semua
 * rute dinamis `/katalog/[id]` yang perlu di-render secara statis (SSG).
 */
export function generateStaticParams() {
  const robotIds = getAllRobotIds().map((id) => ({ id }));
  const itemIds = daftarItem.map((item) => ({ id: String(item.id) }));
  return [...robotIds, ...itemIds];
}

/**
 * Halaman Detail Robot & Item — Server Component dengan Dynamic Route.
 *
 * `params` didefinisikan sebagai `Promise` sesuai standar Next.js 15 terbaru.
 * Mendukung item numerik (Modul 5) dan robot AGV (Modul 4).
 */
export default async function RobotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params (Next.js 15 — params adalah Promise)
  const { id } = await params;

  // 1. Cek apakah format ID adalah numerik (Item Modul 5)
  if (/^\d+$/.test(id)) {
    const item = cariItem(Number(id));
    if (!item) {
      notFound();
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/katalog" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Katalog
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Item #{item.id}: {item.judul}</span>
        </div>

        {/* Kartu Detail Item */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
                  ID #{item.id}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 capitalize">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  {item.kategori}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {item.judul}
              </h1>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                item.tersedia
                  ? "bg-emerald-950/70 text-emerald-400 border-emerald-700/50"
                  : "bg-rose-950/70 text-rose-400 border-rose-700/50"
              }`}
            >
              {item.tersedia ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Tersedia di Gudang
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Tidak Tersedia
                </>
              )}
            </span>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Deskripsi Item
            </h2>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-slate-200 text-sm leading-relaxed">
              {item.deskripsi}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Link
              href="/katalog"
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Katalog
            </Link>
            <Link
              href="/katalog/tambah"
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg transition"
            >
              Tambah Item Lain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Validasi format ID: harus berformat AGV-XX (huruf kapital + angka)
  const idPattern = /^AGV-\d{2,}$/;
  if (!idPattern.test(id)) {
    notFound();
  }

  // Ambil data robot dari modul server-only
  const robot = getRobotById(id);
  if (!robot) {
    notFound();
  }

  // Ambil log rantai hash untuk robot ini
  const logs = getLogsByRobotId(id);

  // Helper: Warna status
  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/50',
    ALERT: 'bg-rose-950/70 text-rose-400 border-rose-700/50',
    CHARGING: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    IDLE: 'bg-cyan-950/70 text-cyan-400 border-cyan-700/50',
    ONLINE: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/50',
    OFFLINE: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const batteryColor = robot.battery < 20
    ? 'text-red-400'
    : robot.battery < 50
    ? 'text-amber-400'
    : 'text-emerald-400';

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/katalog" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Katalog Armada
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">{robot.id}: {robot.name}</span>
      </div>

      {/* Header Robot */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800/60">
                {robot.id}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {robot.name}
              </h1>
            </div>
            <p className="text-sm text-slate-400">{robot.model}</p>
          </div>
          <span className={`inline-flex items-center text-xs font-semibold rounded-full border px-3 py-1.5 ${statusColor[robot.status] || statusColor.OFFLINE}`}>
            {(robot.status === 'ACTIVE' || robot.status === 'ALERT') && (
              <span className="relative flex h-2 w-2 mr-2" aria-hidden="true">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${robot.status === 'ALERT' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${robot.status === 'ALERT' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              </span>
            )}
            Status: {robot.status}
          </span>
        </div>

        {/* Misi */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Misi Saat Ini:</span>
            <p className="text-slate-200 font-medium text-sm mt-0.5">{robot.currentTask}</p>
          </div>
        </div>
      </div>

      {/* Grid Spesifikasi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 border-l-4 border-l-emerald-500 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Battery className={`w-5 h-5 ${batteryColor}`} aria-hidden="true" />
            <span className="text-xs font-medium text-slate-400 uppercase">Daya Baterai</span>
          </div>
          <span className={`text-2xl font-bold ${batteryColor}`}>{robot.battery}%</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 border-l-4 border-l-cyan-500 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-400 uppercase">Kecepatan</span>
          </div>
          <span className="text-2xl font-bold text-white">{robot.speed} <span className="text-sm text-slate-400">m/s</span></span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 border-l-4 border-l-amber-500 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-400 uppercase">Koordinat</span>
          </div>
          <span className="text-2xl font-bold text-white font-mono">({robot.coordinates.x}, {robot.coordinates.y})</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 border-l-4 border-l-purple-500 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-purple-400" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-400 uppercase">Muatan</span>
          </div>
          <span className="text-2xl font-bold text-white">{robot.payloadWeight} <span className="text-sm text-slate-400">kg</span></span>
        </div>
      </div>

      {/* Informasi Tambahan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            Informasi Kriptografi
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Zona Gudang</span>
              <span className="text-white font-medium">{robot.zone}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Checkpoint Head</span>
              <span className="text-cyan-400 font-mono text-[11px] truncate max-w-[200px]" title={robot.checkpointHead}>
                {robot.checkpointHead ? robot.checkpointHead.substring(0, 20) + '...' : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Total Entri Log</span>
              <span className="text-white font-mono font-bold">{robot.totalLogsCount}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Ping Terakhir</span>
              <span className="text-white font-mono text-[11px]">{robot.lastPing}</span>
            </div>
          </div>
        </div>

        {/* Preview Log Terakhir */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-cyan-400" />
            Log Rantai Hash Terbaru ({logs.length} entri tersedia)
          </h3>
          {logs.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {logs.slice(-4).map(entry => (
                <div key={entry.seq} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-cyan-400">Seq #{entry.seq}</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.ts).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    <span>Koordinat: ({entry.payload.x}, {entry.payload.y}) • Kecepatan: {entry.payload.speed} m/s</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-slate-500 truncate" title={entry.mac}>
                    MAC: {entry.mac.substring(0, 24)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 p-4 text-center bg-slate-950/60 rounded-lg border border-slate-800">
              Belum ada log rantai hash yang tersedia untuk robot ini.
            </p>
          )}
        </div>
      </div>

      {/* Navigasi Bawah */}
      <div className="flex items-center justify-between">
        <Link
          href="/katalog"
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}
