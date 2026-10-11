# Robot Fleet Black Box 🛡️🤖
> **Sistem Pemantauan Armada Robot Logistik AGV & Verifikasi Integritas Log Forensik Kriptografi HMAC-SHA256**  
> *Tugas Pengembangan Aplikasi Web (Milestone 1) — Kolaborasi Mata Kuliah Kriptografi dan Keamanan Komputasi dan Siber*

---

## 📋 Daftar Isi
1. [Konsep Produk & Latar Belakang](#-1-konsep-produk--latar-belakang)
2. [Pemetaan 9 Persyaratan Tugas (Milestone 1)](#-2-pemetaan-9-persyaratan-tugas-milestone-1)
3. [Peran Pengguna & Model Hak Akses (RBAC)](#-3-peran-pengguna--model-hak-akses-rbac)
4. [Arsitektur Kriptografi Hash Chain](#-4-arsitektur-kriptografi-hash-chain)
5. [Fitur-Fitur Utama Aplikasi](#-5-fitur-fitur-utama-aplikasi)
6. [Teknologi yang Digunakan](#-6-teknologi-yang-digunakan)
7. [Struktur Folder Kode](#-7-struktur-folder-kode)
8. [Petunjuk Menjalankan Proyek](#-8-petunjuk-menjalankan-proyek)

---

## 🎯 1. Konsep Produk & Latar Belakang

* **Nama Produk:** **Robot Fleet Black Box**
* **Tujuan Produk:** Menyediakan antarmuka pemantauan armada robot otonom (*Automated Guided Vehicle* / AGV) di gudang logistik sekaligus menjadi modul penyelidikan forensik digital untuk memverifikasi keaslian dan mendeteksi manipulasi data log pergerakan saat terjadi insiden (tabrakan, deviasi jalur, *unauthorized stop*).
* **Permasalahan yang Diselesaikan:** 
  Pada operasional logistik otomatis, insiden robot sering kali diikuti oleh upaya peretas atau pihak tidak bertanggung jawab untuk mengubah data telemetri (misalnya menurunkan catatan kecepatan dari 1.9 m/s menjadi 0.5 m/s) demi menutupi kelalaian. Log biasa tanpa perlindungan kriptografi tidak memiliki nilai pembuktian forensik.
* **Solusi Produk:** 
  Aplikasi ini memanfaatkan mekanisme **Hash Chain HMAC-SHA256 (RFC 2104)** dengan *Genesis Block* 64 karakter nol dan *Server Checkpoint Head*. Setiap entri log terikat secara kriptografis dengan entri sebelumnya. Jika satu entri saja diubah, rantai hash terputus dan mesin verifikasi forensik akan secara instan mengidentifikasi nomor sekuens dan data yang dimanipulasi.

---

## ✅ 2. Pemetaan 9 Persyaratan Tugas (Milestone 1)

| No | Persyaratan Rubrik | Implementasi pada Proyek | Status |
|:--:|:---|:---|:--:|
| **1** | **Menentukan konsep produk** | Nama, sasaran, tujuan, dan alur forensik robot AGV terdokumentasi sesuai SRS v0.1. | ✅ Terpenuhi |
| **2** | **Mengembangkan antarmuka produk** | Dibangun dengan **React 18**, **TypeScript**, dan **Tailwind CSS** dengan arsitektur kode bersih dan terstruktur. | ✅ Terpenuhi |
| **3** | **Membangun halaman aplikasi (min. 3)** | Dibuat **4 Halaman Aplikasi Utama**: <br>1. *Pemantauan Armada (Fleet Overview)*<br>2. *Black Box Log Explorer*<br>3. *Investigasi Insiden & Verifikasi Forensik*<br>4. *Pusat Administrasi & Audit Sistem* | ✅ Terpenuhi (4 Halaman) |
| **4** | **Mengembangkan komponen reusable (min. 5)** | Dibuat **7 Komponen Modular**: <br>1. `Button` (primary, secondary, danger, outline, cyber, loading)<br>2. `Badge` (status indicator & pulsing live status)<br>3. `Modal` (accessible dialog with focus trap & ESC)<br>4. `FormField` (`Input`, `Select`, `Textarea` with error/a11y)<br>5. `Card` & `StatCard` (kpi metrics)<br>6. `Alert` (accessible semantic alerts)<br>7. `Tabs` (tablist navigation) | ✅ Terpenuhi (7 Komponen) |
| **5** | **Mengimplementasikan formulir dengan validasi** | **3 Formulir Validasi Sisi Klien**: <br>1. Formulir Disposisi Perintah Robot (`CommandModal.tsx`)<br>2. Formulir Registrasi Insiden Baru (`NewIncidentModal.tsx`)<br>3. Formulir Pendaftaran Robot AGV (`RegisterRobotModal.tsx`) | ✅ Terpenuhi (3 Formulir) |
| **6** | **Menggunakan mock data** | Mock data relasional terstruktur untuk 4 AGV, 24+ entri rantai hash log, berkas insiden forensik, dan jejak audit sistem. | ✅ Terpenuhi |
| **7** | **Menerapkan desain responsif** | Responsif penuh pada layar ponsel ($\le$ 640px), tablet (768px), dan desktop ($\ge$ 1024px). | ✅ Terpenuhi |
| **8** | **Menerapkan aksesibilitas web (A11y)** | Semantic HTML5 (`header`, `nav`, `main`, `footer`), ARIA labels & roles, kontras tinggi, keyboard navigation, focus indicators. Target Lighthouse $\ge$ 90+. | ✅ Terpenuhi |
| **9** | **Menyusun dokumentasi produk** | README.md terperinci menjelaskan konsep, arsitektur, instalasi, dan panduan penggunaan sistem. | ✅ Terpenuhi |

---

## 👥 3. Peran Pengguna & Model Hak Akses (RBAC)

Aplikasi menyediakan tombol *Switch Role* interaktif di bilah navigasi atas:

1. 👷‍♂️ **Operator Gudang:**
   - Memantau kondisi armada (status, level baterai, koordinat real-time pada grid peta gudang 2D).
   - Membuka log pergerakan robot.
   - Mengirim perintah operasional/darurat: `STOP`, `RESUME`, `MOVE_TO`, `CHARGE`.
2. 🕵️‍♂️ **Penyelidik Forensik:**
   - Mencatat berkas investigasi insiden baru.
   - Menjalankan mesin audit integritas kriptografi Hash Chain HMAC-SHA256 secara langsung di peramban.
   - Menguji skenario manipulasi melalui *Tamper Simulator*.
   - Mengunduh dan mencetak Berita Acara / Sertifikat Forensik Resmi (JSON & Print format).
3. 🛡️ **Administrator Sistem:**
   - Mendaftarkan unit robot AGV baru dengan pengaturan *HMAC Pre-Shared Key*.
   - Mengelola parameter keamanan.
   - Memantau riwayat aktivitas pengguna pada tabel *Audit Trail*.

---

## 🔐 4. Arsitektur Kriptografi Hash Chain

Sesuai spesifikasi dokumen SRS (`crypto/blackbox_log.py`), setiap rekaman entri log black box memiliki struktur tuple:

$$\text{Log Entry} = \{\text{seq}, \text{ts}, \text{prev\_mac}, \text{payload}, \text{mac}\}$$

* **Genesis Block (Entri #1):**
  Nilai `prev_mac` awal diisi oleh string 64-karakter nol heksadesimal:
  `"0000000000000000000000000000000000000000000000000000000000000000"`
* **Chaining Rule (Entri $i > 1$):**
  $$\text{entry}[i].\text{prev\_mac} = \text{entry}[i-1].\text{mac}$$
* **Otentikasi Kriptografis:**
  $$\text{mac} = \text{HMAC-SHA256}(K, \text{canonical}(\text{seq}, \text{ts}, \text{prev\_mac}, \text{payload}))$$
* **Head Checkpoint:**
  Nilai MAC entri terakhir (*head*) dikirimkan secara terpisah ke server penyimpanan checkpoint. Jika seorang penyerang memotong (*truncate*) log terakhir, perbedaan head ini akan langsung memicu peringatan pemotongan log.

---

## 🚀 5. Fitur-Fitur Utama Aplikasi

1. **Warehouse Floor 2D Interactive Grid:**
   Visualisasi tata letak gudang 40m $\times$ 35m (Sektor A: Rak, Sektor B: Loading Dock, Sektor C: Sorting, Sektor D: Charging) yang memetakan posisi armada secara dinamis.
2. **Visual Hash Chain Diagram:**
   Visualisasi interaktif blok-blok log dan panah penghubung tanda tangan kriptografi.
3. **Simulasi Serangan / Tamper Simulator:**
   Memungkinkan penguji mengubah kecepatan atau koordinat robot secara sengaja untuk membuktikan ketangguhan deteksi mesin forensik.
4. **Live Verification Engine:**
   Animasi multi-tahap verifikasi hash chain HMAC-SHA256 dengan deteksi mismatch otomatis.
5. **Printable Forensic Certificate:**
   Format berita acara pemeriksaan digital yang dapat dicetak atau diekspor ke format JSON bukti sidang/audit.
6. **Formulir Validasi Ketat:**
   Pencegahan input tidak valid pada pengiriman perintah (koordinat target), pendaftaran unit robot (format regex `AGV-XX`), dan pencatatan insiden.

---

## 💻 6. Teknologi yang Digunakan

* **Frontend Framework:** React 18.3
* **Bahasa:** TypeScript 5.7 (Strict Mode)
* **Styling:** Tailwind CSS 3.4
* **Ikon:** Lucide React
* **Build Tool:** Vite 6.1
* **Engine Kriptografi:** Web Crypto API (`window.crypto.subtle`) dengan fallback HMAC-SHA256 murni

---

## 📁 7. Struktur Folder Kode

```text
web-pemweb/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── RegisterRobotModal.tsx       # Form registrasi AGV
│   │   │   └── UserAuditTable.tsx           # Tabel audit trail
│   │   ├── common/                          # 7 Komponen Reusable
│   │   │   ├── Alert.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Tabs.tsx
│   │   ├── fleet/
│   │   │   ├── CommandModal.tsx             # Form disposisi instruksi AGV
│   │   │   ├── RobotCard.tsx                # Kartu status AGV
│   │   │   └── WarehouseMap.tsx             # Peta 2D gudang interaktif
│   │   ├── forensics/
│   │   │   ├── IncidentList.tsx             # Daftar kasus insiden
│   │   │   ├── NewIncidentModal.tsx         # Form pelaporan insiden baru
│   │   │   ├── VerificationEngine.tsx       # Mesin verifikasi kriptografi
│   │   │   └── VerificationReportModal.tsx  # Laporan berita acara forensik
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── RoleBanner.tsx               # Switcher RBAC
│   │   └── logs/
│   │       ├── HashChainVisualizer.tsx      # Diagram alur rantai hash
│   │       ├── LogTimeline.tsx              # Linimasa tabel log
│   │       └── TamperSimulatorModal.tsx     # Simulator manipulasi data
│   ├── data/
│   │   └── mockData.ts                      # Mock dataset relasional
│   ├── pages/
│   │   ├── AdminManagementPage.tsx          # Halaman Admin
│   │   ├── FleetOverviewPage.tsx            # Halaman Monitoring Armada
│   │   ├── IncidentForensicsPage.tsx        # Halaman Forensik Insiden
│   │   └── LogExplorerPage.tsx              # Halaman Explorer Log
│   ├── types/
│   │   └── index.ts                         # Interface & Domain Types
│   ├── utils/
│   │   └── crypto.ts                        # Implementasi HMAC-SHA256 & Verifier
│   ├── App.tsx                              # Root App Component
│   ├── index.css                            # Global CSS & Print Media Styles
│   └── main.tsx                             # Entry point React
├── index.html                               # Accessible HTML5 template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ 8. Petunjuk Menjalankan Proyek

### Prasyarat
* Node.js versi 18+ (disarankan Node.js 20 atau 24)
* npm versi 9+

### Langkah Menjalankan:
1. Buka terminal pada folder proyek:
   ```bash
   cd "web-pemweb"
   ```
2. Pasang pustaka dependensi (jika belum):
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
4. Buka peramban pada alamat lokal yang tertera:
   `http://localhost:5173/`

### Membangun Versi Produksi:
```bash
npm run build
npm run preview
```

