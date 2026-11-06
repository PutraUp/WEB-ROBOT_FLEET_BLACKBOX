import 'server-only';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Prisma Client Singleton untuk Next.js App Router (Prisma 7).
 * Menggunakan Driver Adapter resmi PostgreSQL (@prisma/adapter-pg).
 * Dilindungi direktif "server-only" agar logika basis data tidak bocor ke klien.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://fleet_user:fleet_password@localhost:5432/fleet_blackbox_db?schema=public';

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    // Modul 7: tampilkan query SQL, warning, dan error di terminal development
    log: ['query', 'warn', 'error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
