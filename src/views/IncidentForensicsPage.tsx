'use client';

import React, { useState } from 'react';
import { AGVRobot, BlackBoxLogEntry, IncidentRecord, IncidentVerificationDetail } from '../types';
import { IncidentList } from '../components/forensics/IncidentList';
import { VerificationEngine } from '../components/forensics/VerificationEngine';
import { NewIncidentModal } from '../components/forensics/NewIncidentModal';
import { VerificationReportModal } from '../components/forensics/VerificationReportModal';
import { StatCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ShieldAlert, ShieldCheck, FileText, AlertTriangle, PlusCircle } from 'lucide-react';

export interface IncidentForensicsPageProps {
  robots: AGVRobot[];
  incidents: IncidentRecord[];
  logsMap: Record<string, BlackBoxLogEntry[]>;
  onAddIncident: (newIncident: Omit<IncidentRecord, 'id' | 'status' | 'verificationResult'>) => void;
  onUpdateIncidentVerification: (incidentId: string, result: IncidentVerificationDetail) => void;
  userRole?: string;
}

export const IncidentForensicsPage: React.FC<IncidentForensicsPageProps> = ({
  robots,
  incidents,
  logsMap,
  onAddIncident,
  onUpdateIncidentVerification
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [reportModalIncident, setReportModalIncident] = useState<IncidentRecord | null>(null);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const targetRobot = robots.find(r => r.id === selectedIncident?.robotId) || robots[0];
  const targetLogs = logsMap[targetRobot?.id] || [];

  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
  const tamperedIncidents = incidents.filter(i => i.status === 'TAMPER_DETECTED').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED').length;

  const handleOpenReport = (incidentToView?: IncidentRecord) => {
    setReportModalIncident(incidentToView || selectedIncident);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            Investigasi Insiden & Verifikasi Forensik Kriptografi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pusat analisis integritas hash chain HMAC-SHA256 untuk pembuktian manipulasi bukti insiden
          </p>
        </div>

        <Button
          variant="cyber"
          onClick={() => setIsNewModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Catat Insiden Baru
        </Button>
      </div>

      {/* Forensic Stat Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Berkas Kasus"
          value={totalIncidents}
          subValue="Insiden Terdata"
          icon={<FileText className="w-5 h-5" />}
          accentColor="cyan"
        />
        <StatCard
          label="Tingkat Kritis & Tinggi"
          value={criticalIncidents}
          subValue="Prioritas Forensik"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="rose"
        />
        <StatCard
          label="Manipulasi Terdeteksi"
          value={tamperedIncidents}
          subValue="Bukti Pelanggaran"
          icon={<ShieldAlert className="w-5 h-5" />}
          accentColor="amber"
          trend={tamperedIncidents > 0 ? { value: 'Terdeteksi via Hash Chain', positive: false } : undefined}
        />
        <StatCard
          label="Kasus Selesai Diaudit"
          value={resolvedIncidents}
          subValue="Integritas Sah"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* Main Forensic Working Area: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Incident cases list */}
        <div className="lg:col-span-5 space-y-4">
          <IncidentList
            incidents={incidents}
            selectedIncidentId={selectedIncident?.id}
            onSelectIncident={i => setSelectedIncidentId(i.id)}
            onOpenNewIncident={() => setIsNewModalOpen(true)}
            onViewReport={i => handleOpenReport(i)}
          />
        </div>

        {/* Right column: Verification Engine for selected incident */}
        <div className="lg:col-span-7 space-y-4">
          {selectedIncident && targetRobot ? (
            <VerificationEngine
              key={selectedIncident.id}
              incident={selectedIncident}
              robot={targetRobot}
              logs={targetLogs}
              onVerificationComplete={onUpdateIncidentVerification}
              onOpenReport={() => handleOpenReport()}
            />
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
              Pilih kasus insiden dari daftar sebelah kiri untuk memulai audit.
            </div>
          )}
        </div>
      </div>

      {/* New Incident Registration Modal */}
      <NewIncidentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        robots={robots}
        onSubmitIncident={onAddIncident}
      />

      {/* Forensic Proof Report Modal */}
      <VerificationReportModal
        isOpen={!!reportModalIncident}
        onClose={() => setReportModalIncident(null)}
        incident={reportModalIncident}
        robot={robots.find(r => r.id === reportModalIncident?.robotId) || null}
      />
    </div>
  );
};
