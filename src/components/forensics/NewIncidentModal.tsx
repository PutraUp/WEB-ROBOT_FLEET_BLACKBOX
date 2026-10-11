import React, { useState } from 'react';
import { AGVRobot, AnomalyType, IncidentRecord, IncidentSeverity } from '../../types';
import { Modal } from '../common/Modal';
import { FormField, Input, Select, Textarea } from '../common/FormField';
import { Button } from '../common/Button';
import { PlusCircle } from 'lucide-react';

export interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  robots: AGVRobot[];
  onSubmitIncident: (incident: Omit<IncidentRecord, 'id' | 'status' | 'verificationResult'>) => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  robots,
  onSubmitIncident
}) => {
  const [robotId, setRobotId] = useState<string>(robots[0]?.id || '');
  const [title, setTitle] = useState('');
  const [anomalyType, setAnomalyType] = useState<AnomalyType>('COLLISION');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [timestamp, setTimestamp] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [investigatorName, setInvestigatorName] = useState('Analis Forensik Cyber-Log');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!robotId) {
      errs.robotId = 'Silakan pilih robot AGV yang terlibat dalam insiden.';
    }

    if (!title.trim()) {
      errs.title = 'Judul insiden wajib diisi.';
    } else if (title.trim().length < 5) {
      errs.title = 'Judul insiden minimal harus terdiri dari 5 karakter.';
    }

    if (!timestamp) {
      errs.timestamp = 'Waktu insiden wajib ditentukan.';
    }

    if (!investigatorName.trim()) {
      errs.investigatorName = 'Nama analis/penyelidik forensik wajib diisi.';
    } else if (investigatorName.trim().length < 3) {
      errs.investigatorName = 'Nama analis minimal 3 karakter.';
    }

    if (!description.trim()) {
      errs.description = 'Kronologi dan rincian insiden wajib diisi.';
    } else if (description.trim().length < 15) {
      errs.description = 'Rincian insiden minimal harus memuat 15 karakter penjelasan.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const selectedRobot = robots.find(r => r.id === robotId);

    setTimeout(() => {
      onSubmitIncident({
        robotId,
        robotName: selectedRobot ? selectedRobot.name : 'Unknown AGV',
        title: title.trim(),
        anomalyType,
        severity,
        timestamp: new Date(timestamp).toISOString(),
        investigatorName: investigatorName.trim(),
        description: description.trim(),
        notes: notes.trim() || undefined
      });
      setIsSubmitting(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setNotes('');
      setErrors({});
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrasi Berkas Insiden Forensik Baru"
      description="Catat insiden operasional atau anomali telemetri untuk investigasi keaslian log kriptografi."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField
            label="Robot AGV Terlibat"
            name="robotId"
            required
            error={errors.robotId}
            helperText="Pilih armada yang mengalami insiden."
          >
            <Select
              value={robotId}
              onChange={e => setRobotId(e.target.value)}
              hasError={!!errors.robotId}
            >
              {robots.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.name} ({r.zone})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Kategori Anomali / Insiden"
            name="anomalyType"
            required
          >
            <Select
              value={anomalyType}
              onChange={e => setAnomalyType(e.target.value as AnomalyType)}
            >
              <option value="COLLISION">Tabrakan / Benturan Objek (COLLISION)</option>
              <option value="UNAUTHORIZED_STOP">Pemberhentian Ilegal (UNAUTHORIZED_STOP)</option>
              <option value="OFF_COURSE">Keluar Rute / Deviasi Jalur (OFF_COURSE)</option>
              <option value="SENSOR_TAMPERING">Manipulasi Sensor Telemetri</option>
              <option value="SUSPECTED_LOG_ALTERATION">Dugaan Pemalsuan Log Black Box</option>
              <option value="COMMUNICATION_LOSS">Kehilangan Sinyal Kontrol</option>
            </Select>
          </FormField>
        </div>

        <FormField
          label="Judul Ringkas Insiden"
          name="title"
          required
          error={errors.title}
          helperText="Contoh: Tabrakan AGV-02 pada kecepatan tinggi di Sektor B"
        >
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Masukkan judul kasus insiden..."
            hasError={!!errors.title}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <FormField label="Tingkat Keparahan (Severity)" name="severity" required>
            <Select
              value={severity}
              onChange={e => setSeverity(e.target.value as IncidentSeverity)}
            >
              <option value="CRITICAL">CRITICAL (Kritis)</option>
              <option value="HIGH">HIGH (Tinggi)</option>
              <option value="MEDIUM">MEDIUM (Sedang)</option>
              <option value="LOW">LOW (Rendah)</option>
            </Select>
          </FormField>

          <FormField
            label="Waktu Kejadian (Lokal)"
            name="timestamp"
            required
            error={errors.timestamp}
          >
            <Input
              type="datetime-local"
              value={timestamp}
              onChange={e => setTimestamp(e.target.value)}
              hasError={!!errors.timestamp}
            />
          </FormField>

          <FormField
            label="Penyelidik Forensik (Lead)"
            name="investigatorName"
            required
            error={errors.investigatorName}
          >
            <Input
              value={investigatorName}
              onChange={e => setInvestigatorName(e.target.value)}
              placeholder="Nama analis forensik..."
              hasError={!!errors.investigatorName}
            />
          </FormField>
        </div>

        <FormField
          label="Kronologi & Rincian Dugaan Masalah"
          name="description"
          required
          error={errors.description}
          helperText="Jelaskan apa yang terjadi, indikasi manipulasi atau anomali telemetri."
        >
          <Textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tuliskan kronologi insiden, dugaan penyebab, dan bukti fisik awal..."
            hasError={!!errors.description}
          />
        </FormField>

        <FormField
          label="Catatan Tambahan / Hipotesis Investigasi (Opsional)"
          name="notes"
        >
          <Input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Contoh: Kunci HMAC terdaftar harus diuji terhadap server checkpoint."
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="cyber"
            isLoading={isSubmitting}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Simpan Berkas Insiden
          </Button>
        </div>
      </form>
    </Modal>
  );
};
