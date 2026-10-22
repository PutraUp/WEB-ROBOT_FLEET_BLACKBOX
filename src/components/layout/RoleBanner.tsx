'use client';

import React from 'react';
import { ShieldCheck, HardHat, ShieldAlert, KeyRound } from 'lucide-react';
import { UserRole } from '../../types';

export interface RoleBannerProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({ currentRole, onRoleChange }) => {
  const roleConfig = {
    OPERATOR: {
      title: 'Peran Aktif: Operator Gudang',
      desc: 'Hak Akses: Memantau status & posisi armada AGV, membuka log pergerakan robot, mengirim perintah operasional darurat (STOP, RESUME, MOVE_TO).',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: HardHat
    },
    FORENSIC: {
      title: 'Peran Aktif: Penyelidik Forensik',
      desc: 'Hak Akses: Membuat catatan insiden baru, menjalankan verifikasi integritas kriptografis hash-chain HMAC-SHA256, menganalisis manipulasi log, mengunduh laporan bukti.',
      badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      icon: ShieldAlert
    },
    ADMIN: {
      title: 'Peran Aktif: Administrator Sistem',
      desc: 'Hak Akses Penuh: Mendaftarkan robot AGV baru, manajemen kunci rahasia HMAC, monitoring audit log aktivitas sistem, seluruh fungsi forensik & operasional.',
      badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: ShieldCheck
    }
  };

  const current = roleConfig[currentRole];
  const Icon = current.icon;

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${current.badgeClass} shrink-0`}>
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white tracking-wide">{current.title}</span>
            <span className="hidden md:inline text-slate-400 ml-2">({current.desc})</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-cyan-400" aria-hidden="true" />
            Switch RBAC:
          </span>
          <button
            onClick={() => onRoleChange('OPERATOR')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              currentRole === 'OPERATOR'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Operator
          </button>
          <button
            onClick={() => onRoleChange('FORENSIC')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              currentRole === 'FORENSIC'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Forensik
          </button>
          <button
            onClick={() => onRoleChange('ADMIN')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              currentRole === 'ADMIN'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

