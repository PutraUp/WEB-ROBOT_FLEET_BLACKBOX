# Dokumen Teknis Modul 5 — Formulir, Validasi, Session, dan Cookie

Nama/NIM   : [ISI NAMA MAHASISWA] / [ISI NIM MAHASISWA]  
Repositori : [ISI TAUTAN REPOSITORI GITHUB]  
Produk     : **Robot Fleet Black Box & Inventory** — Sistem pemantauan armada robot AGV serta katalog perangkat telemetri dan inventaris pendukung.

---

## 1. Skema Validasi

### 1.1 Tabel Kolom Formulir Tambah Item (`skemaItem`)

Validasi bentuk data formulir diimplementasikan menggunakan **Zod 4** pada berkas `src/lib/skema.ts`. Seluruh masukan `FormData` diolah dan divalidasi di sisi server melalui `safeParse()`.

| Nama Kolom | Tipe Data | Aturan Zod 4 | Pesan Galat Spesifik | Keterangan / Nilai Bawaan |
|---|---|---|---|---|
| `judul` | `string` | `.trim().min(3, "Judul minimal 3 karakter").max(80, "Judul maksimal 80 karakter")` | `"Judul minimal 3 karakter"` / `"Judul maksimal 80 karakter"` | Nama item atau perangkat identifikasi |
| `kategori` | `enum` | `z.enum(["energi", "lingkungan", "kampus"], { error: "Pilih salah satu kategori" })` | `"Pilih salah satu kategori"` | Wajib memilih salah satu nilai kategori valid |
| `deskripsi` | `string` | `.trim().min(10, "Deskripsi minimal 10 karakter").max(300, "Deskripsi maksimal 300 karakter")` | `"Deskripsi minimal 10 karakter"` / `"Deskripsi maksimal 300 karakter"` | Rincian fungsional perangkat |
| `tersedia` | `boolean` | `z.stringbool().default(false)` | - | Mengonversi checkbox `"on"` menjadi `true`, default `false` bila tidak dicentang |

### 1.2 Tabel Kolom Formulir Masuk (`skemaMasuk`)

| Nama Kolom | Tipe Data | Aturan Zod 4 | Pesan Galat Spesifik | Keterangan |
|---|---|---|---|---|
| `email` | `string` | `z.email("Format email tidak valid")` | `"Format email tidak valid"` | Memanfaatkan API Zod 4 tingkat atas |
| `kataSandi` | `string` | `z.string().min(8, "Kata sandi minimal 8 karakter")` | `"Kata sandi minimal 8 karakter"` | Batas minimum panjang kredensial masuk |

### 1.3 Aturan Semantik pada Server Action

* **Aturan Semantik**: Judul item tidak boleh duplikat/sudah terdaftar pada basis data (`judulSudahAda(hasil.data.judul)`).
* **Lokasi Pemeriksaan**: Diperiksa di dalam Server Action `simpanItem` pada berkas `src/app/katalog/actions.ts` **setelah** validasi sintaksis skema Zod `safeParse()` berhasil.
* **Alasan Pemisahan**: Skema Zod hanya memvalidasi bentuk dan tipe data (validasi sintaksis/bentuk). Pemeriksaan duplikasi memerlukan pengecekan terhadap data tersimpan di memori/database (validasi semantik). Pemisahan ini menjaga skema tetap murni tanpa efek samping (*pure functions*) dan hemat komputasi (kueri database hanya dipanggil jika format data sudah sah).

---

## 2. Alur Server Action

### 2.1 Urutan Eksekusi `simpanItem`

Setiap pemanggilan Server Action mengikuti urutan standar yang ketat untuk mencegah kebocoran data dan inkonsistensi:

1. **Pemeriksaan Sesi (`bacaSesi()`)**: Memverifikasi apakah klien memiliki cookie sesi yang valid dan terdaftar di server. Jika gagal, langsung mengembalikan status galat: `"Silakan masuk terlebih dahulu."` tanpa memproses formulir.
2. **Validasi Bentuk Data (`skemaItem.safeParse(mentah)`)**: Memeriksa batasan panjang, tipe data, dan enum. Jika gagal, galat per kolom diekstrak menggunakan `z.flattenError(hasil.error).fieldErrors` dan dikembalikan bersama isian lama (`nilai`) agar pengguna tidak perlu mengetik ulang.
3. **Validasi Semantik (`judulSudahAda(...)`)**: Memeriksa apakah judul item telah ada dalam inventaris. Jika duplikat, mengembalikan galat pada kolom judul: `{ judul: ["Judul sudah dipakai item lain"] }`.
4. **Mutasi Data (`tambahItem(...)`)**: Menghasilkan ID auto-increment dan menyimpan entitas baru ke penyimpanan. Blok mutasi dibungkus `try...catch` untuk mencatat galat sistem ke log server (`console.error`), sementara pengguna hanya menerima pesan umum `"Item gagal disimpan. Coba lagi."`.
5. **Revalidasi dan Pengalihan (`revalidatePath` & `redirect`)**: Memanggil `revalidatePath("/katalog")` untuk membatalkan cache halaman katalog, lalu memanggil `redirect(`/katalog/${id}`)`. Pemanggilan `redirect()` diletakkan **di luar blok try...catch** karena `redirect()` bekerja dengan melempar exception khusus Next.js (`NEXT_REDIRECT`). Jika ditaruh di dalam `try`, exception akan ditangkap oleh blok `catch` sehingga navigasi halaman gagal.

### 2.2 Pembagian Berkas

| Berkas | Jenis Komponen / Direktif | Alasan Teknis |
|---|---|---|
| `src/app/katalog/tambah/page.tsx` | **Server Component** | Memeriksa sesi pengguna di server sebelum merender halaman, mengamankan rute dari sisi server. |
| `src/components/FormItem.tsx` | **Client Component** (`"use client"`) | Membutuhkan hook `useActionState` React 19 untuk menangani status pending, umpan balik interaktif, dan atribut ARIA dinamis. |
| `src/app/katalog/actions.ts` | **Server Action** (`"use server"`) | Berjalan murni di server; menerima `FormData`, memproses validasi, sesi, mutasi, dan pengalihan rute. |
| `src/lib/sesi.ts` | **Server-Only Module** (`import "server-only"`) | Mengelola token sesi dan penyimpanan `globalThis` di server; dilarang keras bocor ke bundle klien. |

---

## 3. Bukti Uji Validasi

### 3.1 Tabel Hasil Pengujian (11 Kasus Uji)

Pengujian dieksekusi melalui runner otomatis `node --experimental-strip-types scripts/test-modul05.ts` serta pengujian browser dengan bypass atribut `novalidate`:

| No | Skenario Uji | Masukan Formulir | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| 1 | Input Sah | `judul: "Sensor IoT Baru"`, `kategori: "energi"`, `deskripsi: "Deskripsi lengkap sensor...", tersedia: "on"` | `safeParse` berhasil (`success: true`) | Berhasil disimpan, dialihkan ke `/katalog/[id]` | **LULUS** |
| 2 | Judul < 3 Karakter (`novalidate`) | `judul: "ab"`, `kategori: "energi"`, `deskripsi: "Deskripsi valid minimal 10 karakter"` | Ditolak server: `"Judul minimal 3 karakter"` | Galat tampil di `#galat-judul`, `aria-invalid="true"` | **LULUS** |
| 3 | Judul > 80 Karakter | `judul: 81 karakter 'A'`, `kategori: "energi"`, `deskripsi: "Deskripsi valid..."` | Ditolak server: `"Judul maksimal 80 karakter"` | Galat tampil di `#galat-judul` | **LULUS** |
| 4 | Kategori Kosong / Tidak Sah (`novalidate`) | `judul: "Valid"`, `kategori: ""`, `deskripsi: "Deskripsi valid..."` | Ditolak server: `"Pilih salah satu kategori"` | Galat tampil di `#galat-kategori` | **LULUS** |
| 5 | Deskripsi < 10 Karakter | `judul: "Valid"`, `kategori: "lingkungan"`, `deskripsi: "Pendek"` | Ditolak server: `"Deskripsi minimal 10 karakter"` | Galat tampil di `#galat-deskripsi` | **LULUS** |
| 6 | Deskripsi 400 Karakter (`novalidate`) | `judul: "Valid"`, `kategori: "kampus"`, `deskripsi: 400 karakter 'D'` | Ditolak server: `"Deskripsi maksimal 300 karakter"` | Galat tampil di `#galat-deskripsi` | **LULUS** |
| 7 | Multi-Galat Sekaligus (`novalidate`) | `judul: "ab"`, `kategori: ""`, `deskripsi: 400 karakter 'D'` | 3 galat server dikembalikan bersamaan | Ketiga pesan galat tampil di bawah masing-masing kolom | **LULUS** |
| 8 | Format Email Tidak Valid | `email: "bukan-email"`, `kataSandi: "rahasia123"` | Ditolak server: `"Format email tidak valid"` | Galat tampil di `#galat-email` | **LULUS** |
| 9 | Kata Sandi < 8 Karakter | `email: "pengelola@contoh.ac.id"`, `kataSandi: "pendek"` | Ditolak server: `"Kata sandi minimal 8 karakter"` | Galat tampil di `#galat-sandi` | **LULUS** |
| 10 | Validasi Semantik Duplikasi Judul | `judul: "Sensor Getaran Turbin"` (sudah ada di katalog) | Ditolak di server: `"Judul sudah dipakai item lain"` | Galat muncul di kolom judul, input lain tetap terisi | **LULUS** |
| 11 | Akses Tanpa Sesi | Permintaan POST langsung ke Server Action tanpa cookie sesi | Ditolak di server: `"Silakan masuk terlebih dahulu."` | Pesan status tampil, data tidak termutasi | **LULUS** |

---

## 4. Session dan Cookie

### 4.1 Atribut Cookie Sesi dan Pertimbangan Keamanan

Penerbitan cookie pada `src/lib/sesi.ts` menggunakan konfigurasi standar keamanan OWASP:

```typescript
(await cookies()).set("sesi", id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 28800, // 8 jam
});
```

* **`httpOnly: true`**: Mencegah skrip JavaScript sisi klien membaca cookie melalui `document.cookie`. Ini memitigasi risiko pencurian sesi akibat serangan *Cross-Site Scripting* (XSS).
* **`secure: true` (pada produksi)**: Memastikan cookie hanya dikirimkan melalui saluran terenkripsi HTTPS, mencegah penyadapan (*man-in-the-middle attack*) pada jaringan publik.
* **`sameSite: "lax"`**: Membatasi pengiriman cookie pada permintaan lintas situs (*cross-site requests*). Cookie tidak disertakan pada kueri `POST` pihak ketiga, menahan serangan *Cross-Site Request Forgery* (CSRF).
* **`path: "/"`**: Menjamin cakupan cookie berlaku seragam untuk seluruh rute aplikasi (`/katalog`, `/masuk`, `/admin`, dll.).
* **`maxAge: 28800` (8 jam)**: Menetapkan batas umur cookie secara eksplisit sehingga sesi kedaluwarsa secara otomatis dan membatasi jendela waktu pemanfaatan token curian.

### 4.2 Hasil Uji Skenario Cookie

1. **Uji Cookie Palsu**:
   * Pengguna login dan mendapatkan cookie `sesi`. Nilai cookie diubah secara manual di panel *Application > Cookies* menjadi `sesi_palsu_12345`.
   * Saat mengirim formulir tambah item, `proxy.ts` meloloskan navigasi awal karena kunci cookie ada, namun saat Server Action dijalankan, `bacaSesi()` memeriksa `penyimpanan.get(id)` dan mendapati nilai `null`.
   * Formulir menampilkan pesan status: `"Silakan masuk terlebih dahulu."` dan data tidak tersimpan.
2. **Uji Logout**:
   * Mengklik tombol Keluar memicu fungsi Server Action `keluar()`.
   * Server mengeksekusi `penyimpanan.delete(id)` dan `cookies().delete("sesi")`.
   * Pengguna dialihkan ke beranda `/` dan cookie terhapus dari peramban.
3. **Uji Cookie Lama Setelah Logout**:
   * Nilai cookie sesi lama disalin sebelum logout. Setelah logout, cookie disisipkan kembali secara manual di DevTools.
   * Saat pengguna mengakses `/katalog/tambah`, rute dialihkan kembali ke `/masuk` karena record sesi pada map memori server telah dihapus permanen saat logout (*session revocation*).

---

## 5. Keputusan Teknis

### 5.1 Pola Session di Server vs Token Tanpa Status (JWT) di Cookie

* **Pilihan yang Digunakan**: Session di Server (*Stateful Session*) dengan ID acak UUIDv4 yang disimpan di memori `globalThis` dan dicocokkan dengan cookie.
* **Alasan Pemilihan**:
  1. **Kemampuan Pencabutan Seketika (*Instant Revocation*)**: Dengan session di server, saat pengguna menekan tombol Logout atau terdeteksi anomali keamanan, server cukup menghapus ID sesi dari penyimpanan memori/basis data. Sesi seketika tidak berlaku. Pada JWT murni tanpa status (*stateless*), token tetap sah secara kriptografis sampai masa kedaluwarsanya habis meskipun pengguna sudah logout, kecuali diterapkan mekanisme *denylist/revocation list* yang justru menjadikannya *stateful* kembali.
  2. **Ukuran Header Minimal**: Cookie hanya membawa satu string ID acak (UUIDv4 36 karakter), jauh lebih ringkas dibanding payload JWT bertanda tangan yang memperbesar ukuran setiap header HTTP permintaan.

### 5.2 Batas Peran `proxy.ts` Dibanding Pemeriksaan di Aksi

* **`proxy.ts` (Middleware)** bertindak sebagai **pemeriksaan optimistik di lapisan perbatasan (*edge/routing guard*)**:
  * Berjalan sebelum rute halaman dirender.
  * Hanya memeriksa keberadaan fisik cookie (`request.cookies.has("sesi")`) untuk memberikan pengalaman pengguna yang cepat (mencegah kedipan tampilan/render yang tidak perlu bagi pengunjung anonim dengan langsung mengarahkan ke `/masuk`).
* **Pemeriksaan di Server Action (`bacaSesi()`)** bertindak sebagai **garis pertahanan utama (*authoritative security boundary*)**:
  * Server Action adalah *public POST endpoint* yang dapat dipanggil langsung tanpa membuka antarmuka halaman formulir.
  * Konfigurasi `matcher` pada proxy dapat sewaktu-waktu terlewat atau tidak mencakup pemanggilan API langsung.
  * Server Action memvalidasi keabsahan data sesi, status kedaluwarsa, dan identitas pengguna ke penyimpanan server sebelum menjalankan mutasi data apa pun.

---

## 6. Kendala dan Penyelesaian

| No | Kendala | Penyebab | Penyelesaian |
|---|---|---|---|
| 1 | `useActionState` bernilai `undefined` | Proyek sebelumnya terpasang dengan React 18, sedangkan `useActionState` merupakan API bawaan React 19. | Memperbarui dependensi ke `react@19` dan `react-dom@19` beserta tipe deklarasinya, lalu menyesuaikan penanganan form. |
| 2 | `Next.js can't recognize exported config field in route middleware` | Next.js memerlukan objek literal `{ matcher: [...] }` saat menganalisis rute middleware secara statis, tidak mengizinkan referensi variabel tak terdefinisi. | Mendeklarasikan objek konfigurasi literal secara langsung pada `src/middleware.ts` dan mengekspor `proxy` dari `proxy.ts`. |
| 3 | Bypass validasi HTML oleh penyerang | Pengguna dapat menghapus atribut `required`, `minlength`, dan `maxlength` melalui inspect element atau curl. | Mengimplementasikan validasi Zod 4 di dalam Server Action sehingga masukan tidak sah pasti ditolak di sisi server meskipun lolos di klien. |

---

## 7. Catatan Pemanfaatan AI

* **Alat**: Antigravity Assistant (Gemini 3.8 Flash).
* **Perintah Utama**: "terapkan praktikum modul 5 pada project" dengan menganalisis panduan praktikum Modul 5 (PDF).
* **Bagian yang Digunakan**:
  1. Penulisan skema Zod 4 pada `src/lib/skema.ts` sesuai pedoman API Zod 4 terbaru (`z.flattenError`, `z.stringbool`, `z.email`).
  2. Implementasi modul session aman `src/lib/sesi.ts` dan Server Actions pada `src/app/katalog/actions.ts` serta `src/app/masuk/actions.ts`.
  3. Pembuatan komponen formulir terikat hook `useActionState` React 19 dengan dukungan aksesibilitas ARIA.
  4. Penyusunan runner pengujian otomatis `scripts/test-modul05.ts` untuk memverifikasi 11 skenario uji penolakan dan validasi.
* **Cara Memverifikasi**:
  1. Menjalankan `node --experimental-strip-types scripts/test-modul05.ts` dan memastikan seluruh 11 kasus uji lulus (11 LULUS, 0 GAGAL).
  2. Menjalankan `npx tsc --noEmit` dan memastikan tidak ada galat tipe TypeScript.
  3. Menjalankan `npm run lint` dan memastikan kode bersih dari galat ESLint (`✔ No ESLint warnings or errors`).
  4. Menjalankan `npm run build` dan memverifikasi rute `/masuk`, `/katalog/tambah`, dan `/katalog/[id]` terkompilasi sukses dengan status Static/Dynamic/SSG yang tepat.

