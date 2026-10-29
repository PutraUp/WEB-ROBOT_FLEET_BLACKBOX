import { z } from 'zod';

export const createRobotSchema = (existingIds: string[]) =>
  z.object({
    robotId: z
      .string()
      .trim()
      .min(1, { message: 'ID Robot wajib diisi.' })
      .regex(/^AGV-\d{2,}$/, {
        message: 'Format ID Robot harus berformat AGV-XX (contoh: AGV-05).'
      })
      .refine(id => !existingIds.includes(id.toUpperCase()), {
        message: 'ID Robot tersebut sudah terdaftar dalam armada sistem.'
      }),
    name: z
      .string()
      .trim()
      .min(1, { message: 'Nama unit AGV wajib diisi.' })
      .min(3, { message: 'Nama unit minimal 3 karakter.' }),
    model: z.string().min(1, { message: 'Tipe model AGV wajib dipilih.' }),
    zone: z.string().min(1, { message: 'Zona operasi awal wajib dipilih.' }),
    payloadCapacity: z
      .string()
      .trim()
      .min(1, { message: 'Kapasitas muatan wajib diisi.' })
      .refine(
        val => {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        },
        { message: 'Kapasitas muatan harus berupa angka positif (kg).' }
      ),
    hmacKey: z
      .string()
      .trim()
      .min(1, { message: 'Kunci rahasia HMAC wajib disediakan untuk pengamanan log.' })
      .min(16, { message: 'Kunci HMAC minimal harus memiliki 16 karakter keamanan kriptografi.' })
  });

export type RobotFormData = z.infer<ReturnType<typeof createRobotSchema>>;
