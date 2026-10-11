import React from 'react';
import { AuditLog } from '../../types';
import { ShieldCheck, HardHat, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface UserAuditTableProps {
  auditLogs: AuditLog[];
}

export const UserAuditTable: React.FC<UserAuditTableProps> = ({ auditLogs }) => {
  const getRoleIcon = (role: AuditLog['role']) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      case 'FORENSIC':
        return <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <HardHat className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getStatusBadge = (status: AuditLog['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Sukses
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
            <AlertTriangle className="w-3 h-3" /> Peringatan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
            <XCircle className="w-3 h-3" /> Gagal
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-white tracking-wide">
          Audit Trail Log Aktivitas Sistem ({auditLogs.length} Entri)
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Rekaman jejak seluruh tindakan administratif, eksekusi perintah, dan verifikasi forensik
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3">Waktu Kejadian</th>
              <th scope="col" className="px-4 py-3">Pengguna & Peran</th>
              <th scope="col" className="px-4 py-3">Aksi / Tindakan</th>
              <th scope="col" className="px-4 py-3">Objek Sasaran</th>
              <th scope="col" className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap text-slate-400">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    {getRoleIcon(log.role)}
                    <span>{log.user}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">({log.role})</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">
                  {log.action}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {log.target}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {getStatusBadge(log.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
