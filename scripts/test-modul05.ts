import { skemaItem, skemaMasuk } from '../src/lib/skema.ts';
import { z } from 'zod';

console.log('=== MEMULAI TEST VALIDASI ZOD 4 & SERVER ACTION MODUL 5 ===\n');

let pass = 0;
let fail = 0;

function assert(name: string, condition: boolean, details: string) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    pass++;
  } else {
    console.error(`[FAIL] ${name} - ${details}`);
    fail++;
  }
}

// 1. Uji Kasus Sah
const uji1 = skemaItem.safeParse({
  judul: 'Sensor IoT Baru',
  kategori: 'energi',
  deskripsi: 'Deskripsi lengkap sensor pemantau konsumsi energi.',
  tersedia: 'on'
});
assert('Kasus 1: Input Sah', uji1.success === true, JSON.stringify(uji1));

// 2. Judul < 3 karakter (novalidate)
const uji2 = skemaItem.safeParse({
  judul: 'ab',
  kategori: 'energi',
  deskripsi: 'Deskripsi panjang yang memenuhi batas minimal.',
});
assert('Kasus 2: Judul < 3 karakter ditolak', 
  !uji2.success && z.flattenError(uji2.error).fieldErrors.judul?.[0] === 'Judul minimal 3 karakter',
  JSON.stringify(uji2.error ? z.flattenError(uji2.error).fieldErrors : '')
);

// 3. Judul > 80 karakter
const uji3 = skemaItem.safeParse({
  judul: 'A'.repeat(81),
  kategori: 'energi',
  deskripsi: 'Deskripsi panjang yang memenuhi batas minimal.',
});
assert('Kasus 3: Judul > 80 karakter ditolak', 
  !uji3.success && z.flattenError(uji3.error).fieldErrors.judul?.[0] === 'Judul maksimal 80 karakter',
  JSON.stringify(uji3.error ? z.flattenError(uji3.error).fieldErrors : '')
);

// 4. Kategori Kosong / Tidak Sah (novalidate)
const uji4 = skemaItem.safeParse({
  judul: 'Judul Valid',
  kategori: 'tidak-ada',
  deskripsi: 'Deskripsi panjang yang memenuhi batas minimal.',
});
assert('Kasus 4: Kategori tidak sah ditolak', 
  !uji4.success && z.flattenError(uji4.error).fieldErrors.kategori?.[0] === 'Pilih salah satu kategori',
  JSON.stringify(uji4.error ? z.flattenError(uji4.error).fieldErrors : '')
);

// 5. Deskripsi < 10 karakter
const uji5 = skemaItem.safeParse({
  judul: 'Judul Valid',
  kategori: 'lingkungan',
  deskripsi: 'Pendek',
});
assert('Kasus 5: Deskripsi < 10 karakter ditolak', 
  !uji5.success && z.flattenError(uji5.error).fieldErrors.deskripsi?.[0] === 'Deskripsi minimal 10 karakter',
  JSON.stringify(uji5.error ? z.flattenError(uji5.error).fieldErrors : '')
);

// 6. Deskripsi > 300 karakter (novalidate 400 karakter)
const uji6 = skemaItem.safeParse({
  judul: 'Judul Valid',
  kategori: 'kampus',
  deskripsi: 'D'.repeat(400),
});
assert('Kasus 6: Deskripsi 400 karakter ditolak', 
  !uji6.success && z.flattenError(uji6.error).fieldErrors.deskripsi?.[0] === 'Deskripsi maksimal 300 karakter',
  JSON.stringify(uji6.error ? z.flattenError(uji6.error).fieldErrors : '')
);

// 7. Kombinasi 3 Galat Sekaligus (Simulasi bypass browser novalidate dari panduan)
const uji7 = skemaItem.safeParse({
  judul: 'ab',
  kategori: '',
  deskripsi: 'D'.repeat(400),
});
const galat7 = !uji7.success ? z.flattenError(uji7.error).fieldErrors : ({} as any);
assert('Kasus 7: Tiga galat novalidate sekaligus tertangkap server',
  galat7.judul?.[0] === 'Judul minimal 3 karakter' &&
  galat7.kategori?.[0] === 'Pilih salah satu kategori' &&
  galat7.deskripsi?.[0] === 'Deskripsi maksimal 300 karakter',
  JSON.stringify(galat7)
);

// 8. Skema Masuk - Email tidak valid
const uji8 = skemaMasuk.safeParse({
  email: 'bukan-email',
  kataSandi: 'kata-sandi-panjang'
});
assert('Kasus 8: Format email login tidak valid ditolak',
  !uji8.success && z.flattenError(uji8.error).fieldErrors.email?.[0] === 'Format email tidak valid',
  JSON.stringify(uji8.error ? z.flattenError(uji8.error).fieldErrors : '')
);

// 9. Skema Masuk - Kata sandi < 8 karakter
const uji9 = skemaMasuk.safeParse({
  email: 'admin@contoh.ac.id',
  kataSandi: 'pendek'
});
assert('Kasus 9: Kata sandi login < 8 karakter ditolak',
  !uji9.success && z.flattenError(uji9.error).fieldErrors.kataSandi?.[0] === 'Kata sandi minimal 8 karakter',
  JSON.stringify(uji9.error ? z.flattenError(uji9.error).fieldErrors : '')
);

// 10. Validasi Semantik: Judul sudah ada
const dataTiruan = [
  { id: 1, judul: "Sensor Getaran Turbin", kategori: "energi", deskripsi: "...", tersedia: true }
];
const judulSudahAdaSimulasi = (judul: string) =>
  dataTiruan.some((i) => i.judul.toLowerCase() === judul.toLowerCase());

assert('Kasus 10: Validasi semantik mendeteksi judul kembar',
  judulSudahAdaSimulasi('Sensor Getaran Turbin') === true,
  'Gagal mendeteksi Sensor Getaran Turbin'
);

// 11. Mutasi: tambahItem
const totalSebelum = dataTiruan.length;
const itemBaru = {
  id: Math.max(0, ...dataTiruan.map((i) => i.id)) + 1,
  judul: 'Lampu Penerangan Cerdas',
  kategori: 'kampus' as const,
  deskripsi: 'Penerangan hemat energi otomatis koridor barat.',
  tersedia: true,
};
dataTiruan.push(itemBaru);
assert('Kasus 11: Penambahan item berhasil dengan ID auto-increment',
  itemBaru.id === totalSebelum + 1 && dataTiruan.length === totalSebelum + 1,
  `Expected id ${totalSebelum + 1}, got ${itemBaru.id}`
);

console.log(`\nHASIL TOTAL: ${pass} LULUS, ${fail} GAGAL`);
if (fail > 0) process.exit(1);
