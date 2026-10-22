import React from 'react';
import { getAllRobots } from '../../lib/data';
import { Bot, Battery, MapPin, Gauge, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ─── Komponen Badge Status (Server Component murni, tanpa state) ─────
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    ACTIVE: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/50',
    ALERT: 'bg-rose-950/70 text-rose-400 border-rose-700/50',
    CHARGING: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    IDLE: 'bg-cyan-950/70 text-cyan-400 border-cyan-700/50',
    ONLINE: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/50',
    OFFLINE: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  return (
    <span className={`inline-flex items-center text-xs font-medium rounded-full border px-2.5 py-1 ${variants[status] || variants.OFFLINE}`}>
      {(status === 'ACTIVE' || status === 'ALERT') && (
        <span className="relative flex h-2 w-2 mr-1.5" aria-hidden="true">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'ALERT' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'ALERT' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
        </span>
      )}
      {status}
    </span>
  );
}

/**
 * Halaman Katalog Robot — Server Component.
 *
 * Halaman ini merupakan **Server Component** (bawaan Next.js App Router).
 * Data robot diambil langsung dari modul `src/lib/data.ts` yang dilindungi
 * oleh `import "server-only"`, sehingga kunci HMAC tidak pernah masuk
 * ke bundle JavaScript klien.
 */
export default function KatalogPage() {
  // Akses data di sisi server — fungsi ini hanya berjalan di server
  const robots = getAllRobots();

  const totalRobots = robots.length;
  const activeRobots = robots.filter(r => r.status === 'ACTIVE').length;
  const alertRobots = robots.filter(r => r.status === 'ALERT').length;
  const avgBattery = Math.round(
    robots.reduce((acc, curr) => acc + curr.battery, 0) / (robots.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Bot className="w-6 h-6 text-cyan-400" aria-hidden="true" />
          Katalog Armada Robot AGV
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Registrasi dan spesifikasi teknis seluruh unit robot logistik otonom
        </p>
      </div>

      {/* Ringkasan Statistik (Server-rendered) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 border-l-4 border-l-cyan-500 rounded-xl p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Total Armada</span>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{totalRobots}</span>
          <span className="text-xs text-slate-400 ml-2">Unit</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 border-l-4 border-l-emerald-500 rounded-xl p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Unit Aktif</span>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{activeRobots}</span>
          <span className="text-xs text-slate-400 ml-2">Beroperasi</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 border-l-4 border-l-rose-500 rounded-xl p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Status Siaga</span>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{alertRobots}</span>
          <span className="text-xs text-slate-400 ml-2">Insiden</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 border-l-4 border-l-amber-500 rounded-xl p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Rata-rata Daya</span>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{avgBattery}%</span>
          <span className="text-xs text-slate-400 ml-2">Baterai</span>
        </div>
      </div>

      {/* Grid Kartu Robot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Daftar Katalog Unit ({robots.length} Robot)
          </h2>
          <span className="text-xs text-slate-400">
            Klik unit untuk melihat detail spesifikasi dan log rantai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {robots.map(robot => (
            <Link
              key={robot.id}
              href={`/katalog/${robot.id}`}
              className="block bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/20 transition-all duration-200 group"
            >
              {/* Header Kartu */}
              <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                      {robot.id}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">{robot.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{robot.model}</p>
                </div>
                <StatusBadge status={robot.status} />
              </div>

              {/* Konten Kartu */}
              <div className="p-4 sm:p-5 space-y-3 text-xs">
                {/* Misi */}
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Misi Saat Ini:</span>
                  <p className="text-slate-200 font-medium mt-0.5 truncate">{robot.currentTask}</p>
                </div>

                {/* Telemetri */}
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                    <Battery className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Daya Baterai</span>
                      <span className="font-mono font-bold text-white">{robot.battery}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                    <Gauge className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Kecepatan</span>
                      <span className="font-mono font-bold text-white">{robot.speed} m/s</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Koordinat</span>
                      <span className="font-mono font-semibold text-slate-200">X:{robot.coordinates.x}, Y:{robot.coordinates.y}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                    <Package className="w-4 h-4 text-purple-400 shrink-0" aria-hidden="true" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Muatan Beban</span>
                      <span className="font-mono font-semibold text-slate-200">{robot.payloadWeight} kg</span>
                    </div>
                  </div>
                </div>

                {/* Zona */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Zona: <strong className="text-slate-300">{robot.zone}</strong></span>
                  <span className="font-mono text-[10px]">Head: {robot.checkpointHead ? robot.checkpointHead.substring(0, 8) + '...' : '-'}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Log: <strong className="text-white">{robot.totalLogsCount}</strong> entri</span>
                <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
