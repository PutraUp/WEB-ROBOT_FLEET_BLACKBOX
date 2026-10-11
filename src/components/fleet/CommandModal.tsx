import React, { useState } from 'react';
import { AGVRobot, RobotCommand } from '../../types';
import { Modal } from '../common/Modal';
import { FormField, Input, Select, Textarea } from '../common/FormField';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Send } from 'lucide-react';

export interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: AGVRobot | null;
  onExecuteCommand: (robotId: string, command: RobotCommand) => void;
}

export const CommandModal: React.FC<CommandModalProps> = ({
  isOpen,
  onClose,
  robot,
  onExecuteCommand
}) => {
  const [commandType, setCommandType] = useState<RobotCommand['type']>('STOP');
  const [targetX, setTargetX] = useState<string>('20');
  const [targetY, setTargetY] = useState<string>('15');
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!robot) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!reason.trim()) {
      newErrors.reason = 'Alasan instruksi operasional wajib diisi untuk rekam jejak audit.';
    } else if (reason.trim().length < 5) {
      newErrors.reason = 'Alasan instruksi minimal harus memiliki 5 karakter penjelasan.';
    }

    if (commandType === 'MOVE_TO') {
      const numX = parseFloat(targetX);
      const numY = parseFloat(targetY);

      if (isNaN(numX) || numX < 0 || numX > 40) {
        newErrors.targetX = 'Koordinat target X harus berupa angka antara 0 dan 40 meter.';
      }

      if (isNaN(numY) || numY < 0 || numY > 35) {
        newErrors.targetY = 'Koordinat target Y harus berupa angka antara 0 dan 35 meter.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onExecuteCommand(robot.id, {
        type: commandType,
        targetX: commandType === 'MOVE_TO' ? parseFloat(targetX) : undefined,
        targetY: commandType === 'MOVE_TO' ? parseFloat(targetY) : undefined,
        reason: reason.trim()
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Disposisi Perintah Kontrol: ${robot.id} (${robot.name})`}
      description="Kirim instruksi langsung ke pengendali AGV. Perintah akan dicatat dalam audit log sistem."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Unit Status Alert */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">Status Operasi Saat Ini:</span>
          <span className="font-bold text-cyan-400">{robot.status} &bull; Baterai {robot.battery}%</span>
        </div>

        {/* Command Type Selection */}
        <FormField
          label="Tipe Perintah Instruksi"
          name="commandType"
          required
          helperText="Pilih tindakan yang akan dieksekusi oleh kontroler navigasi robot."
        >
          <Select
            value={commandType}
            onChange={e => {
              setCommandType(e.target.value as RobotCommand['type']);
              setErrors(prev => ({ ...prev, targetX: '', targetY: '' }));
            }}
          >
            <option value="STOP">STOP (Penghentian Darurat Segera / Halt)</option>
            <option value="RESUME">RESUME (Lanjutkan Perjalanan Misi)</option>
            <option value="MOVE_TO">MOVE_TO (Relokasi ke Titik Koordinat Tertentu)</option>
            <option value="CHARGE">CHARGE (Kembali ke Stasiun Pengisian Daya)</option>
            <option value="EMERGENCY_SHUTDOWN">EMERGENCY_SHUTDOWN (Pematian Total Sistem Robot)</option>
          </Select>
        </FormField>

        {/* Conditional Coordinates Input for MOVE_TO */}
        {commandType === 'MOVE_TO' && (
          <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3.5 rounded-lg border border-cyan-900/40 animate-in fade-in">
            <FormField
              label="Target Koordinat X (0 - 40 m)"
              name="targetX"
              required
              error={errors.targetX}
            >
              <Input
                type="number"
                min="0"
                max="40"
                step="0.5"
                value={targetX}
                onChange={e => setTargetX(e.target.value)}
                hasError={!!errors.targetX}
                placeholder="Misal: 15.5"
              />
            </FormField>

            <FormField
              label="Target Koordinat Y (0 - 35 m)"
              name="targetY"
              required
              error={errors.targetY}
            >
              <Input
                type="number"
                min="0"
                max="35"
                step="0.5"
                value={targetY}
                onChange={e => setTargetY(e.target.value)}
                hasError={!!errors.targetY}
                placeholder="Misal: 22.0"
              />
            </FormField>
          </div>
        )}

        {/* Reason / Operational Note */}
        <FormField
          label="Alasan Operasional / Catatan Pengirim"
          name="reason"
          required
          error={errors.reason}
          helperText="Contoh: Pembersihan tumpahan di koridor B-2, segera stop."
        >
          <Textarea
            value={reason}
            onChange={e => {
              setReason(e.target.value);
              if (errors.reason) setErrors(prev => ({ ...prev, reason: '' }));
            }}
            placeholder="Masukkan keterangan mengapa instruksi ini dikirim..."
            rows={3}
            hasError={!!errors.reason}
          />
        </FormField>

        {commandType === 'STOP' && (
          <Alert variant="warning" title="Peringatan Penghentian Darurat">
            Perintah STOP akan langsung mengerem motor robot dan mengunci rem mekanis hingga perintah RESUME diberikan.
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant={commandType === 'STOP' || commandType === 'EMERGENCY_SHUTDOWN' ? 'danger' : 'primary'}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Eksekusi Perintah
          </Button>
        </div>
      </form>
    </Modal>
  );
};
