import type { Metadata } from 'next';
import './globals.css';
import { FleetProvider } from '../context/FleetContext';
import { AppShell } from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Robot Fleet Black Box | Pemantauan & Forensik Integritas Log',
  description:
    'Robot Fleet Black Box - Sistem Pemantauan Armada Robot Logistik AGV dan Verifikasi Integritas Log Forensik Kriptografi HMAC-SHA256',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2306B6D4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='7' width='20' height='14' rx='2' ry='2'></rect><path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'></path></svg>"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-white">
        <FleetProvider>
          <AppShell>{children}</AppShell>
        </FleetProvider>
      </body>
    </html>
  );
}
