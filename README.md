# Robot Fleet Black Box 🛡️🤖

> **Aplikasi Web Pemantauan Armada Robot Logistik AGV & Verifikasi Integritas Log Forensik Kriptografi HMAC-SHA256**  
> *Tugas Pengembangan Aplikasi Web (Milestone 1)*

![Lighthouse Accessibility Score: 93](docs/lighthouse-score.png)

---

## 📑 Daftar Isi
1. [Konsep Produk](#-1-konsep-produk)
2. [Fitur-Fitur Awal](#-2-fitur-fitur-awal)
3. [Teknologi yang Digunakan](#-3-teknologi-yang-digunakan)
4. [Struktur Aplikasi](#-4-struktur-aplikasi)
5. [Hasil Pengujian Lighthouse (Skor 93)](#-5-hasil-pengujian-lighthouse-skor-93)
6. [Petunjuk Menjalankan Proyek](#-6-petunjuk-menjalankan-proyek)

---

## 💡 1. Konsep Produk

### 📌 Latar Belakang & Permasalahan
Pada fasilitas logistik otomatis modern, armada robot otonom (*Automated Guided Vehicle* / AGV) beroperasi secara dinamis mengangkut barang. Ketika terjadi insiden darurat—seperti tabrakan dengan muatan palet, deviasi jalur navigasi, atau penghentian tidak sah (*unauthorized stop*)—pihak forensik membutuhkan data rekaman pergerakan (*black box log*) untuk mengetahui kronologi sebenarnya.

Namun, rekaman log biasa di database konvensional rentan dimanipulasi atau diubah (*tampered*) oleh pihak yang ingin menutupi pelanggaran operasional (contohnya memalsukan catatan kecepatan dari 1.9 m/s menjadi 0.5 m/s). Tanpa jaminan keaslian kriptografis, data log kehilangan kekuatan pembuktiannya.

### 🎯 Tujuan & Solusi
**Robot Fleet Black Box** adalah solusi aplikasi web terpadu yang memadukan pemantauan armada logistik dengan pembuktian integritas log menggunakan modul kriptografi **Hash Chain HMAC-SHA256 (RFC 2104)**:
* **Integritas Rantai Hash:** Setiap entri log terikat secara matematis dengan tanda tangan (*MAC*) dari entri sebelumnya (`prev_mac`).
* **Genesis Block:** Entri pertama diinisialisasi dengan 64 karakter nol heksadesimal (`0000...0000`).
* **Checkpoint Head:** Nilai MAC entri terakhir disimpan terpisah di server untuk mencegah serangan penghapusan/pemotongan log (*truncation attack*).
* **Deteksi Seketika:** Jika peretas memodifikasi satu data saja pada masa lampau, seluruh rantai setelahnya akan rusak dan mesin forensik langsung menunjukkan titik manipulasi beserta perbandingan *Expected MAC* vs *Actual MAC*.

### 👥 Sasaran Pengguna & Peran (RBAC)
Aplikasi mengimplementasikan *Role-Based Access Control* (RBAC) dengan 3 peran pengguna:
1. **Operator Gudang:** Memantau kondisi armada (baterai, status, rute), melihat visual posisi robot di grid gudang, dan mengirim perintah operasional darurat (`STOP`, `RESUME`, `MOVE_TO`, `CHARGE`).
2. **Penyelidik Forensik:** Mencatat berkas investigasi insiden, menjalankan verifikasi integritas rantai log HMAC-SHA256, menguji skenario pemalsuan data (*Tamper Simulator*), serta mencetak/mengunduh Berita Acara Forensik.
3. **Administrator Sistem:** Mendaftarkan unit AGV baru, menetapkan kunci rahasia (*HMAC Pre-Shared Key*), dan memantau riwayat aktivitas pada tabel *Audit Trail*.

---

## ✨ 2. Fitur-Fitur Awal

### 1. Pemantauan Armada & Peta Grid Gudang 2D (`FleetOverviewPage`)
* **Ringkasan KPI Armada:** Kartu metrik real-time untuk total robot terdaftar, unit aktif, status siaga/insiden, dan rata-rata daya baterai.
* **Peta Tata Letak Gudang Interaktif (40m $\times$ 35m):** Memetakan posisi koordinat robot secara visual di Sektor A (Rak Penyimpanan), Sektor B (Loading Dock), Sektor C (Sorting), dan Sektor D (Charging Bays).
* **Penyaringan & Pencarian:** Filter status armada (`ALL`, `ACTIVE`, `ALERT`, `CHARGING`, `IDLE`) serta bilah pencarian instan berdasarkan nama, ID, atau zona operasi.
* **Disposisi Perintah Robot (`CommandModal`):** Formulir pengiriman perintah kontrol (`STOP`, `RESUME`, `MOVE_TO`, `CHARGE`) lengkap dengan validasi batas koordinat X (0–40m), Y (0–35m), dan alasan operasional.

### 2. Penjelajah Log Black Box Rantai (`LogExplorerPage`)
* **Diagram Alur Hash Chain (`HashChainVisualizer`):** Visualisasi rantai blok yang menghubungkan `Genesis` $\to$ `Entry #1` $\to \dots \to$ `Head Checkpoint`.
* **Linimasa Log Rinci (`LogTimeline`):** Tabel entri log berantai dengan format `{seq, ts, prev_mac, payload, mac}`, indikator anomali sensor (peringatan LIDAR, benturan bumper), serta tombol salin hash instan.
* **Simulator Manipulasi Log (`TamperSimulatorModal`):** Fitur demonstrasi untuk menguji sistem dengan cara memodifikasi nilai kecepatan/koordinat entri secara sengaja guna membuktikan kehandalan deteksi forensik.

### 3. Investigasi Insiden & Verifikasi Forensik (`IncidentForensicsPage`)
* **Pencatatan Insiden Baru (`NewIncidentModal`):** Formulir registrasi berkas kasus dengan validasi sisi klien (*required fields*, minimal karakter, kategori anomali, severity).
* **Mesin Audit Kriptografi (`VerificationEngine`):** Mesin verifikasi langkah-demi-langkah yang menghitung ulang tanda tangan HMAC-SHA256 untuk setiap blok entri secara langsung di peramban pengguna.
* **Sertifikat & Berita Acara Forensik (`VerificationReportModal`):** Dokumen bukti resmi hasil audit integritas yang siap dicetak (*print-ready layout*) atau diekspor ke berkas data JSON.

### 4. Pusat Administrasi & Audit Sistem (`AdminManagementPage`)
* **Registrasi Unit AGV Baru (`RegisterRobotModal`):** Formulir validasi format ID robot (regex `AGV-XX`), kapasitas angkut, zona gudang, dan kunci rahasia simetris HMAC.
* **Audit Trail Log (`UserAuditTable`):** Rekaman jejak audit sistem yang mencatat waktu kejadian, pengguna, peran, jenis aksi, dan status eksekusi.

---

## 🛠️ 3. Teknologi yang Digunakan

* **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) (Hybrid Server & Client Components)
* **Frontend Library:** [React 18.3](https://react.dev/) (Functional Components, Hooks, Error Boundaries)
* **Bahasa:** [TypeScript 5.7](https://www.typescriptlang.org/) (Strict type checking)
* **Styling & Desain:** [Tailwind CSS 3.4](https://tailwindcss.com/) (Utility-first CSS, dark industrial cyber theme)
* **Ikonografi:** [Lucide React](https://lucide.dev/) (Cyber security & industrial icons)
* **Keamanan Data:** `server-only` (Mencegah kebocoran kunci HMAC dan data sensitif ke bundle browser)
* **Mesin Kriptografi:** Web Crypto API (`window.crypto.subtle`) dengan fallback HMAC-SHA256 (RFC 2104)

---

## 📂 4. Struktur Aplikasi (Next.js 15 App Router & Modul 4)

Implementasi mematuhi standar **Modul 4 Praktikum Pengembangan Aplikasi Web (2026)**:

```text
web-pemweb/
├── docs/
│   └── lighthouse-score.png           # Bukti screenshot audit Lighthouse (Skor 93)
├── public/                            # Aset statis & favicon
├── src/
│   ├── app/                           # File-based Routing (App Router)
│   │   ├── layout.tsx                 # Root layout bersama yang dipertahankan antar halaman
│   │   ├── loading.tsx                # Global loading state (React Suspense)
│   │   ├── error.tsx                  # Global error boundary (Client Component)
│   │   ├── not-found.tsx              # Halaman 404 global
│   │   ├── page.tsx                   # Rute Beranda (/)
│   │   ├── katalog/                   # Rute Segmen Katalog (/katalog)
│   │   │   ├── page.tsx               # Server Component Katalog Robot AGV
│   │   │   ├── template.tsx           # State remounting behavior test per navigasi
│   │   │   ├── loading.tsx            # Loading indicator katalog
│   │   │   ├── error.tsx              # Error boundary katalog (Client Component)
│   │   │   └── [id]/                  # Rute Dinamis (/katalog/[id])
│   │   │       ├── page.tsx           # Detail robot (params: Promise<{id}>, generateStaticParams, regex validation)
│   │   │       ├── loading.tsx        # Loading detail robot
│   │   │       └── not-found.tsx      # Tampilan khusus saat unit ID tidak ditemukan
│   │   ├── tentang/                   # Rute Tentang (/tentang)
│   │   │   └── page.tsx               # Server Component murni profil sistem & spesifikasi
│   │   ├── logs/                      # Rute Penjelajah Log (/logs)
│   │   ├── forensics/                 # Rute Investigasi Forensik (/forensics)
│   │   └── admin/                     # Rute Admin & Audit (/admin)
│   ├── components/                    # Komponen Antarmuka Terstruktur
│   │   ├── admin/                     # Modal registrasi & tabel audit trail
│   │   ├── common/                    # Komponen reusable (Alert, Badge, Button, Card, Modal, Tabs)
│   │   ├── fleet/                     # Warehouse map, RobotCard, CommandModal
│   │   ├── forensics/                 # Mesin verifikasi HMAC, incident list & report
│   │   ├── layout/                    # AppShell, Navbar, Footer, RoleBanner
│   │   └── logs/                      # Log timeline, hash chain visualizer, tamper modal
│   ├── lib/
│   │   └── data.ts                    # Modul data server-only (dilindungi dari client bundle)
│   ├── context/
│   │   └── FleetContext.tsx           # State management armada & RBAC
│   ├── types/
│   │   └── index.ts                   # Definisi tipe domain
│   └── utils/
│       └── crypto.ts                  # Algoritma HMAC-SHA256 & verifikator rantai
├── .eslintrc.json                     # Konfigurasi ESLint (Next.js core-web-vitals)
├── next.config.mjs                    # Konfigurasi Next.js 15
└── package.json                       # Dependensi proyek
```

---

## 📊 5. Hasil Pengujian Lighthouse (Skor 93)

Pengujian aksesibilitas (*Web Accessibility Audit*) dilakukan langsung pada lingkungan pengujian lokal menggunakan Google Chrome Lighthouse:

| Metrik Audit | Nilai Pengujian | Standar Minimum Tugas | Status Evaluasi |
|:---|:---:|:---:|:---:|
| **Accessibility Score** | <span style="color:#10b981; font-weight:bold; font-size:1.1em;">93 / 100</span> | Minimal 85 | ✅ **Lulus Unggul (+8 poin di atas batas)** |
| **Passed Audits** | **16 Audit Lolos** | - | ✅ Terpenuhi |
| **Not Applicable** | **45 Kategori** | - | ✅ Terpenuhi |

---

## ⚡ 6. Petunjuk Menjalankan Proyek

### Prasyarat Sistem
* [Node.js](https://nodejs.org/) versi 18.18+ atau versi 20+
* [npm](https://www.npmjs.com/) versi 9+

### Langkah-Langkah Menjalankan:

1. **Jalankan server pengembangan (Dev Server):**
   ```bash
   npm run dev
   ```

2. **Buka aplikasi di peramban:**  
   Buka URL lokal:
   👉 **`http://localhost:3000/`**

3. **Verifikasi ESLint & Validasi Kode:**
   ```bash
   npm run lint
   ```

4. **Kompilasi Versi Produksi (Build):**
   ```bash
   npm run build
   npm run start
   ```
