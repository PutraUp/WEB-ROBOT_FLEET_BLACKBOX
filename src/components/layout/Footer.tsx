import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">
                Robot Fleet Black Box - Sistem Pemantauan Armada & Integritas Forensik Kriptografi
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pengembangan Aplikasi Web Pemantauan Armada Logistik & Forensik Kriptografi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-md border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>HMAC-SHA256 Hash Chain</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-md border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Lighthouse A11y &ge; 90+</span>
            </div>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="mt-6 pt-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <nav className="flex flex-wrap items-center gap-4" aria-label="Tautan Bawah">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Beranda</Link>
            <Link href="/katalog" className="hover:text-cyan-400 transition-colors">Katalog Robot</Link>
            <Link href="/logs" className="hover:text-cyan-400 transition-colors">Black Box Logs</Link>
            <Link href="/forensics" className="hover:text-cyan-400 transition-colors">Investigasi Forensik</Link>
            <Link href="/tentang" className="hover:text-cyan-400 transition-colors">Tentang Sistem</Link>
          </nav>
          <div className="flex items-center gap-4 text-slate-500">
            <p>&copy; 2026 Robot Fleet Black Box. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>RFC 2104 (HMAC-SHA256)</span>
              <ExternalLink className="w-3 h-3 text-slate-500" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

