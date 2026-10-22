import 'server-only';

import { AGVRobot, BlackBoxLogEntry, IncidentRecord, AuditLog } from '../types';

/**
 * Kunci rahasia HMAC yang digunakan untuk menandatangani log rantai robot.
 * Dalam produksi, kunci ini disimpan di environment variable / secret manager.
 */
export const ROBOT_HMAC_SECRET_KEY = 'robot_fleet_blackbox_secret_2026_key_pertamina';

export const GENESIS_PREV_MAC = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Data master armada robot AGV (Server-Only).
 * Modul ini hanya dapat diimpor oleh Server Component.
 * Penggunaan `import "server-only"` mencegah impor oleh Client Component
 * sehingga kunci HMAC dan data sensitif tidak bocor ke bundle klien.
 */
export const ROBOTS_DATA: AGVRobot[] = [
  {
    id: 'AGV-01',
    name: 'Titan-Alpha',
    model: 'Forklift AGV-500',
    status: 'ACTIVE',
    battery: 88,
    zone: 'Zone A - Storage Rack',
    coordinates: { x: 14, y: 28 },
    speed: 1.4,
    lastPing: '2026-10-11T15:30:12Z',
    hmacKey: ROBOT_HMAC_SECRET_KEY,
    currentTask: 'Pallet Transfer to Bay A-12',
    payloadWeight: 350,
    checkpointHead: 'a9f24c8710bde40108ecf93415e96a2001bbcf809428a2f9871374491b5c0fbc',
    totalLogsCount: 8
  },
  {
    id: 'AGV-02',
    name: 'Apex-Courier',
    model: 'Underride Tugger 200',
    status: 'ALERT',
    battery: 42,
    zone: 'Zone B - Loading Dock',
    coordinates: { x: 32, y: 10 },
    speed: 0.0,
    lastPing: '2026-10-11T15:32:45Z',
    hmacKey: ROBOT_HMAC_SECRET_KEY,
    currentTask: 'EMERGENCY STOP - Investigasi Insiden',
    payloadWeight: 120,
    checkpointHead: '5cb0a9dc76f988da983e5152a831c66db00327c8bf597fc7c6e00bf3d5a79147',
    totalLogsCount: 10
  },
  {
    id: 'AGV-03',
    name: 'Hermes-Carrier',
    model: 'Heavy Pallet Mover 1000',
    status: 'CHARGING',
    battery: 95,
    zone: 'Charging Bay #1',
    coordinates: { x: 4, y: 6 },
    speed: 0.0,
    lastPing: '2026-10-11T15:31:00Z',
    hmacKey: ROBOT_HMAC_SECRET_KEY,
    currentTask: 'Pengisian Daya Cepat Terjadwal',
    payloadWeight: 0,
    checkpointHead: '106aa07019a4c1161e376c082748774c34b0bcb5391c0cb34ed8aa4a5b9cca4f',
    totalLogsCount: 6
  },
  {
    id: 'AGV-04',
    name: 'Vanguard-Lifter',
    model: 'High-Bay Reach AGV',
    status: 'IDLE',
    battery: 76,
    zone: 'Zone C - Sorting Area',
    coordinates: { x: 22, y: 18 },
    speed: 0.0,
    lastPing: '2026-10-11T15:28:40Z',
    hmacKey: ROBOT_HMAC_SECRET_KEY,
    currentTask: 'Menunggu Penugasan Selesai Batch',
    payloadWeight: 0,
    checkpointHead: '766a0abb81c2c92e92722c85a2bfe8a1a81a664bc24b8b70c76c51a3d192e819',
    totalLogsCount: 5
  }
];

/**
 * Log rantai hash untuk setiap robot (Server-Only).
 */
export const LOGS_DATA: Record<string, BlackBoxLogEntry[]> = {
  'AGV-02': [
    {
      seq: 1,
      ts: '2026-10-11T15:10:00Z',
      prev_mac: GENESIS_PREV_MAC,
      payload: { x: 20, y: 10, speed: 0.0, battery: 48, status: 'ONLINE', task: 'Inisialisasi Sistem Black Box' },
      mac: '83f94a2b109cde87612efac34091ab54817a23c4d5e6f7a8b9c0d1e2f3a4b5c6'
    },
    {
      seq: 2,
      ts: '2026-10-11T15:11:00Z',
      prev_mac: '83f94a2b109cde87612efac34091ab54817a23c4d5e6f7a8b9c0d1e2f3a4b5c6',
      payload: { x: 22, y: 10, speed: 1.0, battery: 47, status: 'ACTIVE', task: 'Mulai Bergerak ke Dock B' },
      mac: '92ab3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
    },
    {
      seq: 3,
      ts: '2026-10-11T15:12:00Z',
      prev_mac: '92ab3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      payload: { x: 25, y: 10, speed: 1.5, battery: 46, status: 'ACTIVE', task: 'Navigasi Jalur Koridor B-1' },
      mac: 'a3bc4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c'
    },
    {
      seq: 4,
      ts: '2026-10-11T15:13:00Z',
      prev_mac: 'a3bc4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
      payload: { x: 28, y: 10, speed: 1.5, battery: 45, status: 'ACTIVE', task: 'Memasuki Area Titik Buta Loading Dock' },
      mac: 'b4cd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
    },
    {
      seq: 5,
      ts: '2026-10-11T15:14:00Z',
      prev_mac: 'b4cd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      payload: { x: 30, y: 10, speed: 1.8, battery: 44, status: 'ACTIVE', sensorAlert: true, eventDescription: 'Peringatan LIDAR: Objek statis terdeteksi pada jarak 3 meter' },
      mac: 'c5de6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'
    },
    {
      seq: 6,
      ts: '2026-10-11T15:14:30Z',
      prev_mac: 'c5de6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      payload: { x: 32, y: 10, speed: 1.9, battery: 43, status: 'ACTIVE', sensorAlert: true, eventDescription: 'Pengereman darurat gagal terpicu! Terjadi benturan' },
      mac: 'd6ef7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f'
    },
    {
      seq: 7,
      ts: '2026-10-11T15:14:45Z',
      prev_mac: 'd6ef7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
      payload: { x: 32, y: 10, speed: 0.0, battery: 42, status: 'ALERT', sensorAlert: true, eventDescription: 'Bumper sensor tripped - Tabrakan palet statis' },
      mac: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8'
    },
    {
      seq: 8,
      ts: '2026-10-11T15:15:00Z',
      prev_mac: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      payload: { x: 32, y: 10, speed: 0.0, battery: 42, status: 'ALERT', eventDescription: 'Black Box auto-lockdown diaktifkan' },
      mac: '5cb0a9dc76f988da983e5152a831c66db00327c8bf597fc7c6e00bf3d5a79147'
    }
  ],
  'AGV-01': [
    {
      seq: 1,
      ts: '2026-10-11T15:00:00Z',
      prev_mac: GENESIS_PREV_MAC,
      payload: { x: 10, y: 20, speed: 0.0, battery: 92, status: 'ONLINE', task: 'Sistem aktif' },
      mac: '1111a9f24c8710bde40108ecf93415e96a2001bbcf809428a2f9871374491b5c'
    },
    {
      seq: 2,
      ts: '2026-10-11T15:05:00Z',
      prev_mac: '1111a9f24c8710bde40108ecf93415e96a2001bbcf809428a2f9871374491b5c',
      payload: { x: 12, y: 25, speed: 1.2, battery: 90, status: 'ACTIVE', task: 'Angkut Pallet A-04' },
      mac: '2222bcf809428a2f9871374491b5c0fbce9b5dba53956c25b59f111f1923f82a'
    },
    {
      seq: 3,
      ts: '2026-10-11T15:10:00Z',
      prev_mac: '2222bcf809428a2f9871374491b5c0fbce9b5dba53956c25b59f111f1923f82a',
      payload: { x: 14, y: 28, speed: 1.4, battery: 88, status: 'ACTIVE', task: 'Pallet Transfer to Bay A-12' },
      mac: 'a9f24c8710bde40108ecf93415e96a2001bbcf809428a2f9871374491b5c0fbc'
    }
  ]
};

// ─── Helper Functions (Server-Only) ──────────────────────────────────
/**
 * Mengambil seluruh data robot dari sumber data server.
 */
export function getAllRobots(): AGVRobot[] {
  return ROBOTS_DATA;
}

/**
 * Mengambil satu robot berdasarkan ID.
 * Mengembalikan `undefined` jika tidak ditemukan.
 */
export function getRobotById(id: string): AGVRobot | undefined {
  return ROBOTS_DATA.find(r => r.id === id);
}

/**
 * Mengambil seluruh ID robot yang valid (untuk generateStaticParams).
 */
export function getAllRobotIds(): string[] {
  return ROBOTS_DATA.map(r => r.id);
}

/**
 * Mengambil log rantai hash untuk robot tertentu.
 */
export function getLogsByRobotId(robotId: string): BlackBoxLogEntry[] {
  return LOGS_DATA[robotId] || [];
}
