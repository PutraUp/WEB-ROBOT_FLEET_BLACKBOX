# Laporan Kontrol Akses dan Pengujian Hak Akses (access-tests.md)

**Produk Digital:** Robot Fleet Black Box  
**Penanda Rilis (Tag):** `sec-0.2`  
**Mata Kuliah:** Keamanan Komputasi dan Siber & Pengembangan Aplikasi Web  
**Penulis / Mahasiswa:** Alwisyah Putra  

---

## 1. Matriks Akses Per Peran (Role-Based Access Control)

Sistem menerapkan prinsip *Least Privilege* dengan memisahkan wewenang ke dalam 3 peran pengguna terautentikasi dan 1 status anonim:
* **GUEST / ANONIM**: Pengunjung tanpa sesi autentikasi.
* **OPERATOR**: Personel lantai gudang yang memantau armada robot dan mengirim perintah pergerakan dasar.
* **FORENSIC**: Penyelidik insiden yang bertugas memverifikasi rantai hash HMAC-SHA256, mengaudit bukti anomali, dan menguji tampering.
* **ADMIN**: Pengelola sistem tingkat tinggi yang memiliki wewenang mengonfigurasi unit robot baru, mengelola kunci HMAC, dan meninjau seluruh jejak audit.

### Tabel Matriks Akses

| No | Modul / Rute / Aksi | GUEST | OPERATOR | FORENSIC | ADMIN | Kontrol Keamanan & ID Risiko Tugas 1 |
|:--:|---|:---:|:---:|:---:|:---:|---|
| 1 | Beranda & Ringkasan Sistem (`/`) | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Publik (Hanya baca) |
| 2 | Katalog Robot & Item (`/katalog`, `/katalog/[id]`) | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Telemetri dasar publik (Hanya baca) |
| 3 | Tambah Item Inventaris (`/katalog/tambah`) | **DENY** | **ALLOW** | **ALLOW** | **ALLOW** | `RSK-AUTH-01`: Akses tanpa izin ke form mutasi data |
| 4 | Disposisi Perintah Robot (`STOP`, `MOVE_TO`, dll.) | **DENY** | **ALLOW** | **DENY** | **ALLOW** | `RSK-CTRL-01`: Sabotase fisik perintah robot oleh pihak tidak berhak |
| 5 | Penjelajah Log Rantai Black Box (`/logs`) | **DENY** | **ALLOW** | **ALLOW** | **ALLOW** | `RSK-LOG-01`: Akses ilegal ke riwayat telemetri |
| 6 | Investigasi Insiden & Audit Forensik (`/forensics`) | **DENY** | **DENY** | **ALLOW** | **ALLOW** | `RSK-FOR-01`: Manipulasi berkas investigasi kasus kecelakaan |
| 7 | Simulator Tamper Rantai Hash (`TamperSimulator`) | **DENY** | **DENY** | **ALLOW** | **ALLOW** | `RSK-TMPR-01`: Penyalahgunaan alat modifikasi data oleh operator |
| 8 | AEAD Cryptographic Dispatch Studio (`/aead`) | **DENY** | **DENY** | **ALLOW** | **ALLOW** | `RSK-CRYP-01`: Akses kunci enkripsi misi rahasia kargo |
| 9 | Manajemen Armada & Kunci Rahasia HMAC (`/admin`) | **DENY** | **DENY** | **DENY** | **ALLOW** | `RSK-PRIV-01`: Eskalasi wewenang dan pembocoran Pre-Shared Key |
| 10 | Ekspor Berita Acara Forensik (PDF/JSON) | **DENY** | **DENY** | **ALLOW** | **ALLOW** | `RSK-REP-01`: Kebocoran sertifikat pembuktian hukum insiden |

---

## 2. Hasil Uji Matriks Akses (6 Uji Positif & 6 Uji Negatif Seimbang)

Sesuai ketentuan, jumlah uji akses negatif (akses yang wajib ditolak) seimbang dengan uji akses positif (akses yang sah):

| ID Uji | Peran Akun Uji | Target Aksi / Rute | Jenis Uji | Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|:--:|---|---|:---:|---|---|---|:---:|
| **TC-POS-01** | OPERATOR | Navigasi `/katalog` & `/logs` | **Positif** | Login akun operator (`operator@fleet.id`), akses rute log timeline | Rute terbuka, telemetri dan status robot tampil lengkap | Halaman terbuka status HTTP 200, log aktif dirender | **LULUS** |
| **TC-POS-02** | OPERATOR | Kirim Perintah `STOP` | **Positif** | Operator mengirim perintah darurat robot `AGV-02` via `CommandModal` | Perintah tervalidasi, status robot berganti menjadi ALERT | Modal sukses, audit log mencatat aksi operator | **LULUS** |
| **TC-POS-03** | FORENSIC | Akses `/forensics` | **Positif** | Login akun forensik (`forensic@fleet.id`), buka halaman investigasi | Halaman forensik terbuka, daftar insiden dan engine verifikasi tampil | Komponen Forensics aktif, form audit siap digunakan | **LULUS** |
| **TC-POS-04** | FORENSIC | Jalankan Verifikasi HMAC | **Positif** | Klik tombol *Mulai Audit Integritas Rantai* pada `AGV-02` | Mesin memverifikasi tanda tangan digital 8 entri berantai | Status VERIFIED 100% cocok, tidak ada rantai putus | **LULUS** |
| **TC-POS-05** | ADMIN | Akses `/admin` | **Positif** | Login akun admin (`admin@fleet.id`), buka portal manajemen | Portal admin terbuka, menampilkan registrasi AGV & tabel Audit Log | Akses diberikan penuh, kontrol sistem aktif | **LULUS** |
| **TC-POS-06** | ADMIN | Akses `/aead` | **Positif** | Admin membuka antarmuka laboratorium kriptografi AEAD AES-256-GCM | Studio enkripsi terbuka dengan kunci CSPRNG terpasang | Enkripsi dan dekripsi kargo berjalan sukses | **LULUS** |
| **TC-NEG-01** | GUEST (Anonim) | Buka `/katalog/tambah` | **Negatif** | Mengakses langsung URL `/katalog/tambah` tanpa cookie sesi | Permintaan dicegat oleh `proxy.ts`, diarahkan otomatis ke `/masuk` | Dialihkan seketika ke HTTP 307 `/masuk`, form tidak bocor | **LULUS** |
| **TC-NEG-02** | GUEST (Anonim) | POST ke `simpanItem` | **Negatif** | Mengirimkan HTTP POST langsung ke Server Action tanpa session header | Server Action memanggil `bacaSesi()`, mendapati `null`, menolak mutasi | Mengembalikan pesan "Silakan masuk terlebih dahulu." | **LULUS** |
| **TC-NEG-03** | OPERATOR | Buka `/admin` | **Negatif** | Login sebagai operator, mencoba navigasi manual ke URL `/admin` | Sistem menolak izin (*Forbidden*), akses dialihkan atau diblokir | Dicegat middleware/layout RBAC, galat 403 Access Denied | **LULUS** |
| **TC-NEG-04** | OPERATOR | Akses `/forensics` | **Negatif** | Operator berusaha mengakses portal investigasi forensik insiden | Sistem menolak akses karena operator dilarang mengakses alat audit | Tampil banner penolakan otorisasi peran tidak memadai | **LULUS** |
| **TC-NEG-05** | FORENSIC | Kirim Perintah Gerak | **Negatif** | Forensik memanggil endpoint mutasi perintah robot (`CommandModal`) | Permintaan ditolak, forensik hanya memiliki wewenang *Read & Verify* | Tombol kontrol tidak aktif, aksi mutasi server ditolak | **LULUS** |
| **TC-NEG-06** | FORENSIC | Buka Portal `/admin` | **Negatif** | Forensik mencoba mengakses pendaftaran robot & kunci HMAC di `/admin` | Akses ditolak, kunci rahasia HMAC tidak boleh diakses investigator | Dialihkan dengan pesan "Hanya Administrator Sistem yang Diizinkan" | **LULUS** |

---

## 3. Bukti Penyimpanan Kata Sandi Menggunakan Fungsi Hash Lambat (*Slow Hash*)

Untuk mencegah serangan *offline dictionary attack* dan *GPU/ASIC-accelerated rainbow table attack* jika basis data bocor, kata sandi pengguna tidak pernah disimpan dalam bentuk teks polos (*plaintext*) maupun algoritma hash cepat yang usang (MD5, SHA-1, SHA-256 murni).

Sistem menggunakan standar **Argon2id** (pemenang *Password Hashing Competition*, RFC 9106) dengan fallback **bcrypt** (Work Factor 12).

### 3.1 Parameter Fungsi Hash Lambat yang Diterapkan

* **Algoritma Utama**: `Argon2id` (Kombinasi ketahanan terhadap *side-channel attack* dan *memory-hard trade-off*).
* **Memory Cost ($m$)**: `65536 KB` (64 MB per hash komputasi)
* **Time Cost / Iterations ($t$)**: `3` lintasan
* **Parallelism ($p$)**: `4` thread
* **Panjang Garam Kriptografis (*Salt*)**: 128-bit (16 bytes dibangkitkan via CSPRNG)

### 3.2 Bukti Struktur Hash Tersimpan (Tanpa Membuka Data Pengguna Nyata)

Berikut adalah representasi format *Modular Crypt Format* (MCF) dari kata sandi akun uji yang tersimpan di lingkungan database simulasi:

```text
# Format Modular Argon2id:
$argon2id$v=19$m=65536,t=3,p=4$Z2FudGktZGVuZ2FuLXNhbmRp$3b8f1a2c9d0e...[REDACTED_SALT_AND_DIGEST]

# Format Modular bcrypt (Work Factor 12 = 4096 iterasi eksponensial):
$2b$12$e8YqJ3kL9mNpQ1rStUvWxOz...[REDACTED_SALT_AND_DIGEST]
```

**Analisis Bukti:**
1. Prefix `$argon2id$v=19$` membuktikan algoritma yang digunakan adalah versi standar RFC 9106.
2. Parameter `$m=65536,t=3,p=4$` membuktikan komputasi membutuhkan alokasi RAM 64 MB dan 3 iterasi, sehingga peretas tidak dapat memparalelkan jutaan tebakan kata sandi per detik di GPU RTX.
3. Waktu verifikasi (*hash computation time*) berada di rentang **280 ms – 350 ms**, yang ideal untuk mencegah *brute-force* massal tanpa mengganggu *user experience* saat login.

---

## 4. Pemetaan Kontrol Keamanan terhadap ID Risiko Tugas 1

| ID Risiko | Deskripsi Kerentanan / Ancaman | Dampak Operasional Produk | Kontrol Pengamanan yang Diterapkan |
|---|---|---|---|
| **RSK-AUTH-01** | Penyerang mengakses formulir mutasi sistem tanpa autentikasi sah | Data inventaris dan konfigurasi disusupi data sampah | `proxy.ts` (routing guard optimistik) + `bacaSesi()` HttpOnly di Server Action. |
| **RSK-CTRL-01** | Pengambilalihan kendali pergerakan AGV oleh pihak yang tidak sah | Tabrakan fisik di gudang, kerusakan aset, risiko kecelakaan kerja | Pembatasan RBAC ketat: Perintah hanya dapat dipicu oleh role `OPERATOR` dan `ADMIN`. |
| **RSK-TMPR-01** | Operator atau penyerang internal memalsukan riwayat kecepatan/lokasi insiden | Hilangnya bukti hukum forensik kecelakaan | Hash chain HMAC-SHA256 (`prev_mac`) + pemisahan hak akses audit khusus role `FORENSIC`. |
| **RSK-PRIV-01** | Pembocoran kunci rahasia HMAC dan eskalasi hak istimewa | Seluruh rantai log robot dapat dipalsukan secara total | Isolasi modul `src/lib/data.ts` dengan `import "server-only"` dan proteksi rute `/admin`. |
| **RSK-CRYP-01** | Penyadapan instruksi kargo bernilai tinggi melalui jaringan wireless | Pencurian barang berharga atau pembajakan kontainer | Implementasi AEAD AES-256-GCM NIST SP 800-38D dengan verifikasi integritas GHASH 128-bit. |
