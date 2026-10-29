# LOG PENGGUNAAN KECERDASAN ARTIFISIAL (AI_LOG.md)

**Mata Kuliah:** Kriptografi & Keamanan Komputasi dan Siber (Produk Bersama Pemweb)  
**Tugas:** Tugas 2 — Enkripsi Terautentikasi dan Integritas Data (AEAD)  
**Repositori:** Robot Fleet Black Box (`PutraUp/WEB-ROBOT_FLEET_BLACKBOX`)  
**Penulis / Mahasiswa:** Alwisyah Putra  
**Git Tag:** `v0.2`  

---

## 1. Ikhtisar Pemanfaatan AI

Sesuai pedoman akademik pada silabus dan ketentuan Tugas 2, penggunaan Artificial Intelligence (AI) diperbolehkan dengan kewajiban dokumentasi transparan, verifikasi mandiri, dan penguasaan materi secara menyeluruh saat demonstrasi lisan.

---

## 2. Tabel Catatan Interaksi AI

| No | Alat AI | Tanggal & Waktu | Tujuan Penggunaan | Ringkasan Perintah (Prompt) | Bagian Kode / Berkas yang Dihasilkan / Diubah | Cara Memeriksa & Validasi Mandiri |
|---|---|---|---|---|---|---|
| **1** | Gemini 3.8 Flash (Antigravity Assistant) | 28 Oktober 2026 | Perancangan arsitektur kriptografi AEAD & analisis parameter | "Terapkan Tugas 2 Enkripsi Terautentikasi dan Integritas Data ke dalam web ini. Web ini adalah gabungan kripto, pemweb, dan siber. Susun KEPUTUSAN.md dan mekanisme AEAD terbaik." | `KEPUTUSAN.md`, `src/lib/crypto/aead.ts` | Membaca spesifikasi NIST SP 800-38D, memvalidasi bahwa IV 96-bit dan tag 128-bit memenuhi standar AES-GCM, memeriksa bahwa tidak ada pustaka pihak ketiga tidak terpelihara. |
| **2** | Gemini 3.8 Flash (Antigravity Assistant) | 28 Oktober 2026 | Implementasi modul kriptografi Web Crypto API dan penanganan kunci CSPRNG | "Buatkan fungsi encryptAEAD, decryptAEAD dengan Web Crypto API bawaan W3C, pastikan fail-closed, generate CSPRNG 256-bit, dan pisahkan penyimpanan kunci ke .env.local." | `src/lib/crypto/aead.ts`, `.env.example`, `.env.local`, `.gitignore` | Menjalankan `node scripts/test-aead.mjs` di terminal; memeriksa status `git status` untuk memastikan `.env.local` tidak terlacak oleh Git; memverifikasi bahwa perubahan 1 byte langsung melempar galat fail-closed. |
| **3** | Gemini 3.8 Flash (Antigravity Assistant) | 28 Oktober 2026 | Pembuatan Suite Pengujian Otomatis 5 Skenario Uji | "Buatkan 5 skenario uji terautomasi (1 kondisi valid, 4 kondisi tidak sah: manipulasi ciphertext, tag, kunci salah, dan AAD)." | `scripts/test-aead.mjs`, `src/app/api/crypto/aead/route.ts`, `package.json` | Menjalankan `npm test` dan `npm run test:crypto` pada konsol shell; memastikan seluruh 5 skenario berstatus PASS dan pengujian berjalan tanpa error. |
| **4** | Gemini 3.8 Flash (Antigravity Assistant) | 28 Oktober 2026 | Pembuatan Halaman Antarmuka Lab Interaktif & Demonstrasi | "Buatkan komponen UI AeadStudio dan rute /aead yang memiliki fitur lab enkripsi, simulasi tamper interaktif, dan panduan presentasi 3 menit." | `src/components/crypto/AeadStudio.tsx`, `src/app/aead/page.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/AppShell.tsx` | Membuka rute `/aead` pada peramban web; menguji interaktivitas tombol tamper, regenerasi kunci CSPRNG, dan memastikan tata letak responsif tanpa galat TypeScript (`npx tsc --noEmit`). |

---

## 3. Verifikasi Data Sintetis & Bebas Rahasia (*No Secrets in Repo*)

Pemeriksaan keamanan data telah dilakukan sebelum commit:
1. **Tidak Ada Kunci Privat / Rahasia:** Nilai kunci simetris di repositori hanya berupa template placeholder pada `.env.example`.
2. **Kunci Asli Di Luar Repositori:** Kunci pengembangan disimpan di `.env.local` yang secara tegas diabaikan oleh `.gitignore`.
3. **Data Uji Sintetis:** Seluruh payload (seperti nama vaksin, ID robot `AGV-01`, kode PIN) merupakan data sintetis simulasi dan tidak memuat data pribadi atau rahasia organisasi riil.

---

## 4. Pernyataan Pemahaman Mahasiswa

Seluruh alur enkripsi, parameter kriptografi (kunci 256-bit, IV 96-bit, AAD, dan Tag 128-bit), logika *fail-closed*, serta hasil pengujian pada repositori ini telah dipelajari, diverifikasi secara mandiri, dan siap dijelaskan serta didemonstrasikan dalam waktu 3 menit pada evaluasi praktikum Pekan 6.
