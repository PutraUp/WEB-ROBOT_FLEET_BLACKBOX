import type { Metadata } from 'next';
import { LoginForm } from '../../components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login & Autentikasi | Robot Fleet Black Box',
  description: 'Halaman autentikasi sistem pemantauan armada robot AGV dengan validasi form Zod.'
};

export default function LoginPage() {
  return (
    <div className="py-4 sm:py-8">
      <LoginForm />
    </div>
  );
}
