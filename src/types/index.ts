export type UserRole = 'OPERATOR' | 'FORENSIC' | 'ADMIN';

export type RobotStatus = 'ONLINE' | 'ACTIVE' | 'IDLE' | 'CHARGING' | 'ALERT' | 'OFFLINE';

export interface AGVRobot {
  id: string;
  name: string;
  model: string;
  status: RobotStatus;
  battery: number;
  zone: string;
  coordinates: { x: number; y: number };
  speed: number; // m/s
  lastPing: string;
  hmacKey: string;
  currentTask: string;
  payloadWeight: number; // kg
  checkpointHead?: string; // MAC entri terakhir yang tercatat
  totalLogsCount: number;
}

export interface LogPayload {
  x: number;
  y: number;
  speed: number;
  battery: number;
  status: RobotStatus;
  task?: string;
  weight?: number;
  sensorAlert?: boolean;
  eventDescription?: string;
}

export interface BlackBoxLogEntry {
  seq: number;
  ts: string;
  prev_mac: string;
  payload: LogPayload;
  mac: string;
  isTampered?: boolean; // flag helper untuk demonstrasi jika diubah
  tamperReason?: string;
}

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnomalyType = 
  | 'COLLISION'
  | 'UNAUTHORIZED_STOP'
  | 'OFF_COURSE'
  | 'COMMUNICATION_LOSS'
  | 'SENSOR_TAMPERING'
  | 'SUSPECTED_LOG_ALTERATION';

export interface IncidentVerificationDetail {
  verifiedAt: string;
  isValid: boolean;
  totalEntriesChecked: number;
  tamperedSeq: number | null;
  tamperedField: string | null;
  expectedMac: string | null;
  actualMac: string | null;
  checkpointHeadMatched: boolean;
  chainIntegrityStatus: 'VERIFIED' | 'TAMPERED_ENTRY' | 'BROKEN_CHAIN' | 'TRUNCATED_LOG';
  details: string;
}

export interface IncidentRecord {
  id: string;
  robotId: string;
  robotName: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  anomalyType: AnomalyType;
  timestamp: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'TAMPER_DETECTED';
  investigatorName: string;
  verificationResult?: IncidentVerificationDetail;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  target: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface RobotCommand {
  type: 'STOP' | 'RESUME' | 'MOVE_TO' | 'CHARGE' | 'EMERGENCY_SHUTDOWN';
  targetX?: number;
  targetY?: number;
  reason?: string;
}

