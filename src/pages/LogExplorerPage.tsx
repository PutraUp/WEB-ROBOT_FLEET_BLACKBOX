import React, { useState } from 'react';
import { AGVRobot, BlackBoxLogEntry } from '../types';
import { HashChainVisualizer } from '../components/logs/HashChainVisualizer';
import { LogTimeline } from '../components/logs/LogTimeline';
import { TamperSimulatorModal } from '../components/logs/TamperSimulatorModal';
import { Button } from '../components/common/Button';
import { Terminal, Cpu } from 'lucide-react';
import { Alert } from '../components/common/Alert';
import { verifyLogChain } from '../utils/crypto';

export interface LogExplorerPageProps {
  robots: AGVRobot[];
  logsMap: Record<string, BlackBoxLogEntry[]>;
  selectedRobotId: string;
  onSelectRobotId: (robotId: string) => void;
  onUpdateLogs: (robotId: string, updatedLogs: BlackBoxLogEntry[]) => void;
  onNavigateToForensics: () => void;
}

export const LogExplorerPage: React.FC<LogExplorerPageProps> = ({
  robots,
  logsMap,
  selectedRobotId,
  onSelectRobotId,
  onUpdateLogs,
  onNavigateToForensics
}) => {
  const [tamperModalEntry, setTamperModalEntry] = useState<BlackBoxLogEntry | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [quickVerifyResult, setQuickVerifyResult] = useState<{
    isValid: boolean;
    message: string;
    tamperedSeq?: number | null;
  } | null>(null);

  const currentRobot = robots.find(r => r.id === selectedRobotId) || robots[0];
  const currentLogs = logsMap[currentRobot?.id] || [];

  const handleQuickVerify = async () => {
    if (!currentRobot || currentLogs.length === 0) return;
    setIsVerifying(true);
    const result = await verifyLogChain(currentLogs, currentRobot.hmacKey, currentRobot.checkpointHead);
    setIsVerifying(false);

    setQuickVerifyResult({
      isValid: result.isValid,
      message: result.details,
      tamperedSeq: result.tamperedSeq
    });
  };

  const handleApplyTamper = (seq: number, modifiedPayload: BlackBoxLogEntry['payload'], reason: string) => {
    const updated = currentLogs.map(entry => {
      if (entry.seq === seq) {
        return {
          ...entry,
          payload: modifiedPayload,
          isTampered: true,
          tamperReason: reason
        };
      }
      return entry;
    });

    onUpdateLogs(currentRobot.id, updated);
    setQuickVerifyResult(null); // Reset until re-verified
  };

  const handleResetEntry = (seq: number) => {
    const updated = currentLogs.map(entry => {
      if (entry.seq === seq) {
        return {
          ...entry,
          isTampered: false,
          tamperReason: undefined
        };
      }
      return entry;
    });

    onUpdateLogs(currentRobot.id, updated);
    setQuickVerifyResult(null);
  };

  const hasAnyTampered = currentLogs.some(l => l.isTampered);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Terminal className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            Penjelajah Log Black Box Rantai (Hash Chain Explorer)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Inspeksi audit jejak telemetri robot dengan perlindungan rantai HMAC-SHA256
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="cyber"
            size="md"
            isLoading={isVerifying}
            onClick={handleQuickVerify}
            leftIcon={<Cpu className="w-4 h-4" />}
          >
            Uji Integritas Rantai Sekarang
          </Button>
        </div>
      </div>

      {/* Robot Selection Tabs Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase mr-1 whitespace-nowrap">
            Pilih Unit:
          </span>
          {robots.map(robot => {
            const isSelected = robot.id === currentRobot?.id;
            const robotLogs = logsMap[robot.id] || [];
            const hasTamper = robotLogs.some(l => l.isTampered);

            return (
              <button
                key={robot.id}
                onClick={() => {
                  onSelectRobotId(robot.id);
                  setQuickVerifyResult(null);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-950 font-bold'
                    : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{robot.id} ({robot.name})</span>
                {hasTamper && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" title="Terdapat entri dimanipulasi"></span>
                )}
              </button>
            );
          })}
        </div>

        {currentRobot && (
          <div className="flex items-center gap-3 text-xs text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
            <span className="font-mono">Total: <strong className="text-white">{currentLogs.length}</strong> entri</span>
            <span>&bull;</span>
            <span className="font-mono text-cyan-400 font-semibold truncate max-w-[150px]">
              Kunci: {currentRobot.hmacKey.substring(0, 10)}...
            </span>
          </div>
        )}
      </div>

      {/* Quick Verification Alert Result */}
      {quickVerifyResult && (
        <Alert
          variant={quickVerifyResult.isValid ? 'success' : 'danger'}
          title={quickVerifyResult.isValid ? 'Integritas Log Terverifikasi Valid' : 'Peringatan: Rantai Log Tidak Valid / Dimanipulasi!'}
          onDismiss={() => setQuickVerifyResult(null)}
        >
          <div className="space-y-2">
            <p>{quickVerifyResult.message}</p>
            {!quickVerifyResult.isValid && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToForensics}
                  className="text-xs"
                >
                  Buka Menu Investigasi Forensik Kasus
                </Button>
              </div>
            )}
          </div>
        </Alert>
      )}

      {hasAnyTampered && !quickVerifyResult && (
        <Alert
          variant="warning"
          title="Mode Simulasi Aktif: Data Log Telah Dimodifikasi"
        >
          Salah satu entri log pada unit ini telah diubah melalui simulasi tamper. Jalankan pengujian kriptografi untuk melihat bagaimana sistem mendeteksi pemalsuan tersebut.
        </Alert>
      )}

      {/* Visual Hash Chain Diagram */}
      <HashChainVisualizer
        entries={currentLogs}
        checkpointHead={currentRobot?.checkpointHead}
        tamperedSeq={quickVerifyResult?.tamperedSeq}
      />

      {/* Detailed Log Table */}
      <LogTimeline
        entries={currentLogs}
        onOpenTamperModal={entry => setTamperModalEntry(entry)}
        tamperedSeq={quickVerifyResult?.tamperedSeq}
      />

      {/* Tamper Modal */}
      <TamperSimulatorModal
        isOpen={!!tamperModalEntry}
        onClose={() => setTamperModalEntry(null)}
        entry={tamperModalEntry}
        onApplyTamper={handleApplyTamper}
        onResetEntry={handleResetEntry}
      />
    </div>
  );
};
