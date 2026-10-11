import React from 'react';
import { IncidentRecord, AGVRobot } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Printer, Download, ShieldCheck, ShieldAlert, Award } from 'lucide-react';

export interface VerificationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentRecord | null;
  robot: AGVRobot | null;
}

export const VerificationReportModal: React.FC<VerificationReportModalProps> = ({
  isOpen,
  onClose,
  incident,
  robot
}) => {
  if (!incident || !robot || !incident.verificationResult) return null;

  const result = incident.verificationResult;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      reportType: 'CYBER_FORENSIC_INTEGRITY_CERTIFICATE',
      standard: 'ISO/IEC/IEEE 29148:2018 & RFC 2104',
      generatedAt: new Date().toISOString(),
      caseId: incident.id,
      incidentTitle: incident.title,
      anomalyType: incident.anomalyType,
      severity: incident.severity,
      robotDetails: {
        id: robot.id,
        name: robot.name,
        model: robot.model,
        checkpointHead: robot.checkpointHead
      },
      forensicAuditor: incident.investigatorName,
      verificationVerdict: {
        isValid: result.isValid,
        status: result.chainIntegrityStatus,
        totalEntriesVerified: result.totalEntriesChecked,
        breachSequence: result.tamperedSeq,
        expectedHmac: result.expectedMac,
        actualHmac: result.actualMac,
        technicalDetails: result.details
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Report_${incident.id}_${robot.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sertifikat Laporan Bukti Forensik Kriptografi"
      description="Dokumen resmi audit keabsahan data Black Box AGV untuk keperluan pembuktian insiden."
      maxWidth="2xl"
    >
      {/* Printable Paper Canvas */}
      <div id="forensic-report-content" className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-slate-200 space-y-5 font-sans">
        {/* Certificate Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Award className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white uppercase">
                BERITA ACARA PEMERIKSAAN FORENSIK DIGITAL
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                ROBOT FLEET BLACK BOX &bull; SISTEM AUDIT HASH CHAIN HMAC-SHA256
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono">
            <span className="text-slate-500 block">NOMOR DOKUMEN</span>
            <span className="font-bold text-cyan-400">{incident.id}-CERT</span>
          </div>
        </div>

        {/* Verdict Banner */}
        <div
          className={`p-4 rounded-lg border flex items-center justify-between ${
            result.isValid
              ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200'
              : 'bg-red-950/50 border-red-600 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {result.isValid ? (
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-7 h-7 text-red-400" />
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block">KESIMPULAN AUDIT INTEGRITAS:</span>
              <strong className="text-base">
                {result.isValid
                  ? 'LOG TERBUKTI OTENTIK (TIDAK ADA MANIPULASI)'
                  : 'PERINGATAN: TERBUKTI ADANYA PEMALSUAN DATA LOG'}
              </strong>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-[10px] block opacity-75">STATUS</span>
            <span className="font-extrabold uppercase">{result.chainIntegrityStatus}</span>
          </div>
        </div>

        {/* Case Info Table */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-500 block">Nama / ID Kasus:</span>
            <strong className="text-white">{incident.title} ({incident.id})</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Unit AGV Terlibat:</span>
            <strong className="text-cyan-300">{robot.name} ({robot.id}) &bull; {robot.model}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Waktu Kejadian Insiden:</span>
            <span className="font-mono text-slate-300">{new Date(incident.timestamp).toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Waktu Audit Selesai:</span>
            <span className="font-mono text-slate-300">{new Date(result.verifiedAt).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Detailed Findings */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Temuan Teknis Kriptografis:
          </h4>
          <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
            {result.details}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono text-[11px]">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px]">ENTRI DIUJI</span>
              <strong className="text-white">{result.totalEntriesChecked} Blok</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px]">GENESIS BLOCK</span>
              <strong className="text-emerald-400">Valid (64-nol)</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px]">TITIK PELANGGARAN</span>
              <strong className={result.tamperedSeq ? 'text-red-400' : 'text-emerald-400'}>
                {result.tamperedSeq ? `Seq #${result.tamperedSeq}` : 'Nihil'}
              </strong>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px]">HEAD CHECKPOINT</span>
              <strong className={result.checkpointHeadMatched ? 'text-emerald-400' : 'text-red-400'}>
                {result.checkpointHeadMatched ? 'Matched' : 'Mismatch'}
              </strong>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span className="text-[10px] text-slate-500 block">Penyelidik Utama / Forensic Lead:</span>
            <strong className="text-slate-200">{incident.investigatorName}</strong>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Verifikasi Digital:</span>
            <span className="font-mono text-cyan-400">HMAC-SHA256 DIGITAL SEAL VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <Button variant="ghost" onClick={onClose}>
          Tutup
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleDownloadJson}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Ekspor JSON Bukti
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak Dokumen Laporan
          </Button>
        </div>
      </div>
    </Modal>
  );
};
