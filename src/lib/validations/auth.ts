import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Alamat email wajib diisi.' })
    .email({ message: 'Format alamat email tidak valid (contoh: operator@fleet.id).' }),
  password: z
    .string()
    .min(1, { message: 'Kata sandi wajib diisi.' })
    .min(6, { message: 'Kata sandi minimal harus terdiri dari 6 karakter.' })
    .max(50, { message: 'Kata sandi tidak boleh melebihi 50 karakter.' }),
  role: z.enum(['OPERATOR', 'FORENSIC', 'ADMIN'], {
    message: 'Silakan pilih peran pengguna yang valid.'
  }),
  rememberMe: z.boolean().default(false)
});

export type LoginFormData = z.infer<typeof loginSchema>;
