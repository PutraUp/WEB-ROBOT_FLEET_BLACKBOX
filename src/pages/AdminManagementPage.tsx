import React, { useState } from 'react';
import { AGVRobot, AuditLog } from '../types';
import { UserAuditTable } from '../components/admin/UserAuditTable';
import { RegisterRobotModal } from '../components/admin/RegisterRobotModal';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { HardHat, Key, PlusCircle, Lock, Server } from 'lucide-react';

export interface AdminManagementPageProps {
  robots: AGVRobot[];
  auditLogs: AuditLog[];
  onRegisterRobot: (robot: AGVRobot) => void;
  userRole?: string;
}

export const AdminManagementPage: React.FC<AdminManagementPageProps> = ({
  robots,
  auditLogs,
  onRegisterRobot
}) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <HardHat className="w-6 h-6 text-purple-400" aria-hidden="true" />
            Pusat Administrasi Armada & Audit Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pengelolaan unit AGV, konfigurasi kunci kriptografi HMAC, dan rekaman audit jejak aktivitas
          </p>
        </div>

        <Button
          variant="cyber"
          onClick={() => setIsRegisterModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Daftarkan Robot AGV Baru
        </Button>
      </div>

      {/* RBAC Security & Crypto Architecture Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/90 border-slate-800">
          <CardHeader className="pb-3 flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Model Hak Akses (RBAC)
            </CardTitle>
            <Badge variant="purple" size="sm">3 Peran</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <p>&bull; <strong className="text-white">Operator:</strong> Kendali armada, buka log, perintah STOP/RESUME.</p>
            <p>&bull; <strong className="text-white">Forensik:</strong> Verifikasi HMAC-SHA256, buka insiden, cetak bukti.</p>
            <p>&bull; <strong className="text-white">Admin:</strong> Registrasi robot, kelola secret keys, audit trail.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800">
          <CardHeader className="pb-3 flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Kriptografi Hash Chain
            </CardTitle>
            <Badge variant="success" size="sm">RFC 2104</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <p>&bull; <strong className="text-white">Genesis:</strong> 64 digit nol untuk blok pertama.</p>
            <p>&bull; <strong className="text-white">Pointer Rantai:</strong> Prev MAC mengikat seluruh log sebelumnya.</p>
            <p>&bull; <strong className="text-white">Checkpoint:</strong> MAC Head server mencegah pemotongan log.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800">
          <CardHeader className="pb-3 flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              Persiapan Milestone 2
            </CardTitle>
            <Badge variant="warning" size="sm">Roadmap</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <p>&bull; Migrasi mock data ke database SQLite / PostgreSQL.</p>
            <p>&bull; Koneksi REST API ke simulator pergerakan robot AGV.</p>
            <p>&bull; Integrasi langsung backend Python modul crypto/blackbox_log.py.</p>
          </CardContent>
        </Card>
      </div>

      {/* AGV Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Daftar Robot Terdaftar & Kunci Rahasia ({robots.length} Unit)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hanya Administrator yang memiliki wewenang mengelola kredensial kriptografis ini
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3">ID Robot</th>
                <th scope="col" className="px-4 py-3">Nama & Model</th>
                <th scope="col" className="px-4 py-3">Zona Gudang</th>
                <th scope="col" className="px-4 py-3 font-mono">HMAC Pre-Shared Key</th>
                <th scope="col" className="px-4 py-3">Kapasitas</th>
                <th scope="col" className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {robots.map(robot => (
                <tr key={robot.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                    {robot.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    <div>{robot.name}</div>
                    <div className="text-[10px] text-slate-500">{robot.model}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {robot.zone}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] text-slate-300" title={robot.hmacKey}>
                      {robot.hmacKey.substring(0, 16)}...
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {robot.payloadWeight} kg
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant={
                        robot.status === 'ACTIVE'
                          ? 'success'
                          : robot.status === 'ALERT'
                          ? 'danger'
                          : 'info'
                      }
                      size="sm"
                    >
                      {robot.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail Log Table */}
      <UserAuditTable auditLogs={auditLogs} />

      {/* Register AGV Robot Modal */}
      <RegisterRobotModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterRobot={onRegisterRobot}
        existingIds={robots.map(r => r.id)}
      />
    </div>
  );
};
