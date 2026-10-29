import type { Metadata } from 'next';
import { AeadStudio } from '../../components/crypto/AeadStudio';

export const metadata: Metadata = {
  title: 'AEAD AES-256-GCM Studio | Robot Fleet Black Box',
  description:
    'Modul Enkripsi Terautentikasi dan Integritas Data (Tugas 2 Kriptografi, Pemweb & Siber) dengan NIST SP 800-38D AES-GCM.'
};

export default function AeadPage() {
  return (
    <div className="py-4">
      <AeadStudio />
    </div>
  );
}
