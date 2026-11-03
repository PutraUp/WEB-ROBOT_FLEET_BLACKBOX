import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database PostgreSQL...');

  // 1. Seeding Data Item Katalog (Idempoten via upsert)
  const items = [
    {
      id: 1,
      judul: 'Sensor Getaran Turbin',
      kategori: 'energi',
      deskripsi: 'Pemantau vibrasi real-time untuk turbin generator pembangkit listrik.',
      tersedia: true,
    },
    {
      id: 2,
      judul: 'Pengukur Kualitas Udara Lab',
      kategori: 'lingkungan',
      deskripsi: 'Sensor partikulat PM2.5 dan PM10 untuk keselamatan ruangan praktikum.',
      tersedia: true,
    },
    {
      id: 3,
      judul: 'Smart Metering Gedung Utama',
      kategori: 'kampus',
      deskripsi: 'Pencatat konsumsi daya listrik per lantai gedung rektorat.',
      tersedia: false,
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { judul: item.judul },
      update: {
        kategori: item.kategori,
        deskripsi: item.deskripsi,
        tersedia: item.tersedia,
      },
      create: item,
    });
  }

  // 2. Seeding Data Armada Robot AGV (Idempoten via upsert)
  const robots = [
    {
      id: 'AGV-01',
      name: 'Titan-Alpha',
      model: 'Forklift AGV-500',
      status: 'ACTIVE',
      battery: 88,
      zone: 'Zone A - Storage Rack',
      speed: 1.4,
      hmacKey: 'robot_fleet_blackbox_secret_2026_key_pertamina_01',
      currentTask: 'Pallet Transfer to Bay A-12',
      payloadWeight: 350.0,
      totalLogsCount: 8,
    },
    {
      id: 'AGV-02',
      name: 'Apex-Courier',
      model: 'Underride Tugger 200',
      status: 'ALERT',
      battery: 42,
      zone: 'Zone B - Loading Dock',
      speed: 0.0,
      hmacKey: 'robot_fleet_blackbox_secret_2026_key_pertamina_02',
      currentTask: 'EMERGENCY STOP - Investigasi Insiden',
      payloadWeight: 120.0,
      totalLogsCount: 10,
    },
    {
      id: 'AGV-03',
      name: 'Hermes-Carrier',
      model: 'Heavy Pallet Mover 1000',
      status: 'CHARGING',
      battery: 95,
      zone: 'Charging Bay #1',
      speed: 0.0,
      hmacKey: 'robot_fleet_blackbox_secret_2026_key_pertamina_03',
      currentTask: 'Pengisian Daya Cepat Terjadwal',
      payloadWeight: 0.0,
      totalLogsCount: 6,
    },
    {
      id: 'AGV-04',
      name: 'Vanguard-Lifter',
      model: 'High-Bay Reach AGV',
      status: 'IDLE',
      battery: 76,
      zone: 'Zone C - Sorting Area',
      speed: 0.0,
      hmacKey: 'robot_fleet_blackbox_secret_2026_key_pertamina_04',
      currentTask: 'Menunggu Penugasan Selesai Batch',
      payloadWeight: 0.0,
      totalLogsCount: 5,
    },
  ];

  for (const robot of robots) {
    await prisma.robot.upsert({
      where: { id: robot.id },
      update: robot,
      create: robot,
    });
  }

  console.log('Seeding basis data PostgreSQL berhasil diselesaikan.');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

