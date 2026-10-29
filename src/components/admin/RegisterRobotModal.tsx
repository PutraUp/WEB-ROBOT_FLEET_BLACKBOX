import React, { useState } from 'react';
import { AGVRobot } from '../../types';
import { Modal } from '../common/Modal';
import { FormField, Input, Select } from '../common/FormField';
import { Button } from '../common/Button';
import { Bot } from 'lucide-react';
import { ROBOT_HMAC_SECRET_KEY } from '../../data/mockData';
import { createRobotSchema } from '../../lib/validations/robot';

export interface RegisterRobotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterRobot: (robot: AGVRobot) => void;
  existingIds: string[];
}

export const RegisterRobotModal: React.FC<RegisterRobotModalProps> = ({
  isOpen,
  onClose,
  onRegisterRobot,
  existingIds
}) => {
  const [robotId, setRobotId] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('Forklift AGV-500');
  const [zone, setZone] = useState('Zone A - Storage Rack');
  const [payloadCapacity, setPayloadCapacity] = useState('500');
  const [hmacKey, setHmacKey] = useState(ROBOT_HMAC_SECRET_KEY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const schema = createRobotSchema(existingIds);
    const result = schema.safeParse({
      robotId,
      name,
      model,
      zone,
      payloadCapacity,
      hmacKey
    });

    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        if (!errs[fieldName]) {
          errs[fieldName] = issue.message;
        }
      });
      setErrors(errs);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newRobot: AGVRobot = {
        id: robotId.trim().toUpperCase(),
        name: name.trim(),
        model,
        status: 'ONLINE',
        battery: 100,
        zone,
        coordinates: { x: 10, y: 10 },
        speed: 0.0,
        lastPing: new Date().toISOString(),
        hmacKey: hmacKey.trim(),
        currentTask: 'Unit Baru Diaktifkan - Siap Misi',
        payloadWeight: 0,
        totalLogsCount: 1,
        checkpointHead: '0000000000000000000000000000000000000000000000000000000000000000'
      };

      onRegisterRobot(newRobot);
      setIsSubmitting(false);
      onClose();
      // Reset form
      setRobotId('');
      setName('');
      setErrors({});
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pendaftaran Unit Robot AGV Baru"
      description="Registrasikan robot baru ke armada dan tetapkan kredensial kriptografis Black Box."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField
            label="ID Robot (AGV-XX)"
            name="robotId"
            required
            error={errors.robotId}
            helperText="Format: AGV-05, AGV-06, dst."
          >
            <Input
              value={robotId}
              onChange={e => setRobotId(e.target.value.toUpperCase())}
              placeholder="Contoh: AGV-05"
              hasError={!!errors.robotId}
            />
          </FormField>

          <FormField
            label="Nama Unit Panggilan"
            name="name"
            required
            error={errors.name}
            helperText="Nama unik robot (contoh: Atlas-Rover)"
          >
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Atlas-Rover"
              hasError={!!errors.name}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Tipe / Model AGV" name="model" required>
            <Select value={model} onChange={e => setModel(e.target.value)}>
              <option value="Forklift AGV-500">Forklift AGV-500 (Heavy Lift)</option>
              <option value="Underride Tugger 200">Underride Tugger 200 (Compact Tow)</option>
              <option value="Heavy Pallet Mover 1000">Heavy Pallet Mover 1000</option>
              <option value="High-Bay Reach AGV">High-Bay Reach AGV (Vertical Racks)</option>
            </Select>
          </FormField>

          <FormField label="Zona Operasi Awal" name="zone" required>
            <Select value={zone} onChange={e => setZone(e.target.value)}>
              <option value="Zone A - Storage Rack">Zone A - Storage Rack</option>
              <option value="Zone B - Loading Dock">Zone B - Loading Dock</option>
              <option value="Zone C - Sorting Area">Zone C - Sorting Area</option>
              <option value="Charging Bay #1">Charging Bay #1</option>
            </Select>
          </FormField>
        </div>

        <FormField
          label="Kapasitas Muatan Beban Maksimal (kg)"
          name="payloadCapacity"
          required
          error={errors.payloadCapacity}
        >
          <Input
            type="number"
            min="10"
            max="3000"
            value={payloadCapacity}
            onChange={e => setPayloadCapacity(e.target.value)}
            hasError={!!errors.payloadCapacity}
          />
        </FormField>

        <FormField
          label="Kunci Rahasia HMAC (Pre-Shared Secret Key)"
          name="hmacKey"
          required
          error={errors.hmacKey}
          helperText="Kunci simetris unik yang ditanam pada modul crypto/blackbox_log.py di memori robot."
        >
          <Input
            value={hmacKey}
            onChange={e => setHmacKey(e.target.value)}
            hasError={!!errors.hmacKey}
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
            leftIcon={<Bot className="w-4 h-4" />}
          >
            Daftarkan Robot Baru
          </Button>
        </div>
      </form>
    </Modal>
  );
};
