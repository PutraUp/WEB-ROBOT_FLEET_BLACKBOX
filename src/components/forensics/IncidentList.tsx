import React from 'react';
import { IncidentRecord } from '../../types';
import { Badge, BadgeVariant } from '../common/Badge';
import { Button } from '../common/Button';
import { ShieldAlert, Clock, FileCheck, ArrowRight } from 'lucide-react';

export interface IncidentListProps {
  incidents: IncidentRecord[];
  selectedIncidentId?: string;
  onSelectIncident: (incident: IncidentRecord) => void;
  onOpenNewIncident: () => void;
  onViewReport: (incident: IncidentRecord) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onOpenNewIncident,
  onViewReport
}) => {
  const getSeverityBadgeVariant = (severity: IncidentRecord['severity']): BadgeVariant => {
    switch (severity) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'neutral';
    }
  };

  const getStatusBadge = (status: IncidentRecord['status']) => {
    switch (status) {
      case 'TAMPER_DETECTED':
        return (
          <Badge variant="danger" pulse>
            Manipulasi Terdeteksi
          </Badge>
        );
      case 'RESOLVED':
        return <Badge variant="success">Integritas Terverifikasi</Badge>;
      case 'INVESTIGATING':
        return <Badge variant="warning">Sedang Diinvestigasi</Badge>;
      default:
        return <Badge variant="neutral">Menunggu Audit</Badge>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            Daftar Kasus Insiden Forensik ({incidents.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih insiden untuk memulai proses verifikasi kriptografi log black box
          </p>
        </div>
        <Button
          variant="cyber"
          size="sm"
          onClick={onOpenNewIncident}
          leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
        >
          Catat Insiden Baru
        </Button>
      </div>

      <div className="divide-y divide-slate-800">
        {incidents.map(incident => {
          const isSelected = selectedIncidentId === incident.id;

          return (
            <div
              key={incident.id}
              className={`p-4 sm:p-5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/80 border-l-4 border-l-cyan-500'
                  : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
              }`}
              onClick={() => onSelectIncident(incident)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {incident.id}
                    </span>
                    <Badge variant={getSeverityBadgeVariant(incident.severity)} size="sm">
                      {incident.severity}
                    </Badge>
                    <span className="text-xs font-mono font-medium text-slate-300">
                      Unit: <strong className="text-white">{incident.robotId}</strong> ({incident.robotName})
                    </span>
                    {getStatusBadge(incident.status)}
                  </div>

                  <h4 className="text-sm sm:text-base font-semibold text-white mt-2">
                    {incident.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {incident.description}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(incident.timestamp).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {incident.verificationResult && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        leftIcon={<FileCheck className="w-3.5 h-3.5 text-cyan-400" />}
                        onClick={e => {
                          e.stopPropagation();
                          onViewReport(incident);
                        }}
                      >
                        Laporan Bukti
                      </Button>
                    )}
                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="text-xs"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Pilih Kasus
                    </Button>
                  </div>
                </div>
              </div>

              {/* Anomaly and investigator metadata footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-300">
                  Tipe: <strong>{incident.anomalyType}</strong>
                </span>
                <span>Penyelidik: <strong className="text-slate-300">{incident.investigatorName}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
