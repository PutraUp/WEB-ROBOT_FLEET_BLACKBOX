import React, { useState } from 'react';
import { AGVRobot, BlackBoxLogEntry, IncidentRecord, IncidentVerificationDetail } from '../../types';
import { verifyLogChain } from '../../utils/crypto';
import { Button } from '../common/Button';
import { ShieldCheck, ShieldAlert, Cpu, RefreshCw, Key, FileText } from 'lucide-react';

export interface VerificationEngineProps {
  incident: IncidentRecord;
  robot: AGVRobot;
  logs: BlackBoxLogEntry[];
  onVerificationComplete: (incidentId: string, result: IncidentVerificationDetail) => void;
  onOpenReport: () => void;
}

export const VerificationEngine: React.FC<VerificationEngineProps> = ({
  incident,
  robot,
  logs,
  onVerificationComplete,
  onOpenReport
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [verificationResult, setVerificationResult] = useState<IncidentVerificationDetail | null>(
    incident.verificationResult || null
  );

  const steps = [
    'Inisialisasi Kunci Rahasia HMAC & Checkpoint Terdaftar',
    'Validasi Integritas Genesis Block (64-nol prev_mac)',
    'Pemeriksaan Kontinuitas Nomor Urut Sekuensial (seq 1..n)',
    'Verifikasi Pointer Rantai Hash (entry[i].prev_mac == entry[i-1].mac)',
    'Rekalkulasi Tanda Tangan Kriptografis HMAC-SHA256 per Blok',
    'Komparasi Head MAC terhadap Checkpoint Server (Deteksi Truncation)'
  ];

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setCurrentStep(1);

    // Simulate animated verification steps for clear UX & demonstration
    for (let s = 1; s <= steps.length; s++) {
      setCurrentStep(s);
      await new Promise(r => setTimeout(r, 250));
    }

    // Call real cryptographic HMAC-SHA256 hash-chain verification!
    const result = await verifyLogChain(logs, robot.hmacKey, robot.checkpointHead);
    setVerificationResult(result);
    setIsVerifying(false);
    onVerificationComplete(incident.id, result);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-5">
      {/* Header Case Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
            AUDIT KASUS: {incident.id}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            {incident.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Target Robot: <strong className="text-slate-200">{robot.id} ({robot.name})</strong> &bull; Total Log: <strong className="text-cyan-400">{logs.length} entri</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="cyber"
            size="md"
            isLoading={isVerifying}
            onClick={handleRunVerification}
            leftIcon={<Cpu className="w-4 h-4" />}
          >
            {verificationResult ? 'Jalankan Ulang Verifikasi' : 'Mulai Verifikasi Kriptografi'}
          </Button>

          {verificationResult && (
            <Button
              variant="secondary"
              size="md"
              onClick={onOpenReport}
              leftIcon={<FileText className="w-4 h-4 text-cyan-400" />}
            >
              Unduh / Cetak Bukti
            </Button>
          )}
        </div>
      </div>

      {/* Verification Parameters Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Algoritma Kriptografi:</span>
          <span className="font-mono font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            HMAC-SHA256 (RFC 2104)
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Registered Head Checkpoint:</span>
          <span className="font-mono text-slate-300 truncate block mt-0.5" title={robot.checkpointHead}>
            {robot.checkpointHead ? robot.checkpointHead.substring(0, 18) + '...' : 'Tidak ada'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Penyelidik Bertanggung Jawab:</span>
          <span className="text-slate-300 font-medium block mt-0.5">
            {incident.investigatorName}
          </span>
        </div>
      </div>

      {/* Animated Step Progress during verification */}
      {isVerifying && (
        <div className="bg-slate-950 p-4 rounded-lg border border-cyan-500/30 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Menjalankan Audit Kriptografis Step {currentStep} / {steps.length}...
            </span>
            <span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            {steps[currentStep - 1]}
          </p>
        </div>
      )}

      {/* Verification Verdict Display */}
      {verificationResult && !isVerifying && (
        <div className="space-y-4 animate-in fade-in">
          {verificationResult.isValid ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 shrink-0">
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-emerald-300">
                      INTEGRITAS LOG TERVERIFIKASI ASLI (OTENTIK)
                    </h4>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Status: VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {verificationResult.details}
                  </p>
                  <div className="mt-3 pt-3 border-t border-emerald-900/50 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
                    <span>Total Entri Diperiksa: <strong className="text-white">{verificationResult.totalEntriesChecked}</strong></span>
                    <span>Genesis Status: <strong className="text-emerald-400">Cocok (64-nol)</strong></span>
                    <span>Head Checkpoint: <strong className="text-emerald-400">Sinkron</strong></span>
                    <span>Waktu Audit: <strong className="text-slate-400">{new Date(verificationResult.verifiedAt).toLocaleTimeString('id-ID')}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/60 text-red-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-900/80 border border-red-500/60 text-red-300 shrink-0">
                  <ShieldAlert className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-red-300">
                      PERINGATAN: MANIPULASI LOG TERDETEKSI (TAMPER ALERT)!
                    </h4>
                    <span className="text-xs font-mono text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                      Status: {verificationResult.chainIntegrityStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {verificationResult.details}
                  </p>

                  {/* Forensic Proof Discrepancy Box */}
                  <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-red-900/60 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Titik Pelanggaran Rantai:</span>
                      <span className="text-red-400 font-bold">Entri Sequence #{verificationResult.tamperedSeq}</span>
                    </div>
                    {verificationResult.expectedMac && (
                      <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400 gap-1">
                        <span>Expected HMAC (Kalkulasi Kriptografis):</span>
                        <span className="text-emerald-400 truncate max-w-xs" title={verificationResult.expectedMac}>
                          {verificationResult.expectedMac}
                        </span>
                      </div>
                    )}
                    {verificationResult.actualMac && (
                      <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400 gap-1">
                        <span>Actual HMAC (Ditemukan di Database Log):</span>
                        <span className="text-red-400 truncate max-w-xs" title={verificationResult.actualMac}>
                          {verificationResult.actualMac}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
