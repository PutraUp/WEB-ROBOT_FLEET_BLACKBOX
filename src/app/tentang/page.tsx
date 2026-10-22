import React from 'react';
import { ShieldCheck, Lock, Code2, Users, ExternalLink } from 'lucide-react';

/**
 * Halaman Tentang — Server Component.
 *
 * Seluruh konten bersifat statis (tanpa state / interaksi peramban),
 * sehingga tidak memerlukan direktif `"use client"`.
 * Ini merupakan contoh Server Component murni yang di-render di server.
 */
export default function TentangPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-cyan-400" aria-hidden="true" />
          Tentang Robot Fleet Black Box
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Sistem Pemantauan Armada Robot Logistik AGV dan Verifikasi Integritas Log Forensik Kriptografi
        </p>
      </div>

      {/* Deskripsi Utama */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          Apa itu Robot Fleet Black Box?
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Robot Fleet Black Box</strong> adalah aplikasi web pemantauan armada
          robot logistik otonom (<em>Automated Guided Vehicle</em> / AGV) yang dilengkapi sistem verifikasi
          integritas log berbasis kriptografi <strong className="text-cyan-400">HMAC-SHA256</strong>. Sistem ini
          menyediakan jejak audit (<em>audit trail</em>) forensik yang tidak dapat dimanipulasi, serupa konsep
          kotak hitam (<em>black box</em>) pada pesawat terbang.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Setiap entri log telemetri robot — koordinat posisi, kecepatan, status baterai, dan peristiwa sensor —
          dilindungi oleh rantai hash kriptografis. Setiap entri baru secara matematis terikat dengan entri sebelumnya
          melalui pointer <code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded text-xs">prev_mac</code>,
          membentuk rantai (<em>hash chain</em>) yang tidak dapat dipalsukan tanpa memutus seluruh rantai berikutnya.
        </p>
      </div>

      {/* Fitur Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Integritas Kriptografi</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Menggunakan standar HMAC-SHA256 (RFC 2104) untuk menandatangani setiap entri log. Blok Genesis
            diawali dengan 64 digit nol, dan setiap blok berikutnya membawa <em>prev_mac</em> dari blok sebelumnya.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Forensik Insiden</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Modul verifikasi forensik mampu mendeteksi tiga jenis serangan: pemalsuan isi log
            (<em>Tampered Entry</em>), pemutusan rantai (<em>Broken Chain</em>), dan pemotongan log
            (<em>Truncation Attack</em>).
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Kontrol Akses RBAC</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tiga peran pengguna: <strong>Operator</strong> (kendali armada), <strong>Forensik</strong> (verifikasi
            HMAC dan investigasi insiden), serta <strong>Admin</strong> (registrasi robot, manajemen kunci,
            dan audit trail).
          </p>
        </div>
      </div>

      {/* Arsitektur Teknis */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">Arsitektur \u0026 Teknologi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Framework</span>
            <span className="text-white font-semibold">Next.js 15 (App Router)</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Bahasa</span>
            <span className="text-white font-semibold">TypeScript (Strict Mode)</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Styling</span>
            <span className="text-white font-semibold">Tailwind CSS v3</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Kriptografi</span>
            <span className="text-white font-semibold">Web Crypto API + HMAC-SHA256</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Ikon</span>
            <span className="text-white font-semibold">Lucide React</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Rendering</span>
            <span className="text-white font-semibold">Server \u0026 Client Components</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white mb-3">Referensi Standar</h2>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            RFC 2104 (HMAC)
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            SHA-256 (FIPS 180-4)
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            Web Crypto API (W3C)
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-4">
          &copy; 2026 Robot Fleet Black Box — Praktikum Pengembangan Aplikasi Web, Universitas Pertamina.
        </p>
      </div>
    </div>
  );
}
