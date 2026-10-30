# Catatan Pengerasan Sistem dan Kontainer (hardening-notes.md)

**Produk:** Robot Fleet Black Box  
**Penanda Rilis:** `sec-0.2`  
**Penulis / Mahasiswa:** Alwisyah Putra  
**Mata Kuliah:** Keamanan Komputasi dan Siber (Tugas 2)  

---

## 1. Pengerasan Mesin Virtual (VM Hardening)

Pengerasan dilakukan pada sistem operasi Ubuntu 24.04 LTS yang menjadi *host* server aplikasi armada robot untuk mencapai standar CIS Benchmark dan indeks Lynis minimal 70.

### 1.1 Konfigurasi Pengerasan SSH Daemon

Berkas konfigurasi `/etc/ssh/sshd_config.d/99-hardened.conf` diterapkan dengan aturan ketat:

```ini
# Menolak login langsung menggunakan user superuser root
PermitRootLogin no

# Menonaktifkan autentikasi password interaktif (wajib SSH Key)
PasswordAuthentication no

# Mengaktifkan verifikasi kunci publik kriptografis (ED25519 / RSA 4096-bit)
PubkeyAuthentication yes

# Membatasi toleransi percobaan login gagal untuk mencegah brute-force
MaxAuthTries 3

# Menutup koneksi mengambang (idle timeout) setelah 5 menit
ClientAliveInterval 300
ClientAliveCountMax 2

# Menolak login dengan password kosong
PermitEmptyPasswords no
```

#### Bukti Verifikasi Perintah Wajib:
Sesuai ketentuan penugasan, perintah pemeriksaan konfigurasi aktif SSH menghasilkan:

```bash
$ sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin'
permitrootlogin no
passwordauthentication no
```

*Status:* **BERHASIL TERVERIFIKASI**. Kredensial password ditolak total; hanya pemegang *private key* SSH yang dapat membuka sesi terminal server.

---

### 1.2 Firewall dan Pengendalian Jaringan (UFW)

Firewall internal diaktifkan dengan prinsip *Default Deny*:
1. `sudo ufw default deny incoming` — Menolak semua paket masuk yang tidak terdaftar secara eksplisit.
2. `sudo ufw default allow outgoing` — Mengizinkan koneksi keluar untuk pembaruan paket sistem.
3. `sudo ufw allow 22/tcp` — Akses SSH aman melalui port standar.
4. `sudo ufw allow 443/tcp` — Lalu lintas terenkripsi HTTPS untuk portal web armada robot.
5. Port PostgreSQL (`5432`) **tidak dibuka** di firewall host.

---

### 1.3 Pembaruan Otomatis Celah Keamanan (Unattended-Upgrades)

Paket `unattended-upgrades` dan `apt-listchanges` dipasang dan diaktifkan. Konfigurasi `/etc/apt/apt.conf.d/50unattended-upgrades` disetel untuk mengunduh dan memasang *security patches* kernel dan pustaka kritis secara otomatis tanpa intervensi manual.

---

### 1.4 Hasil Audit Sistem Lynis

| Metrik Audit | Sebelum Hardening (`lynis-before.txt`) | Sesudah Hardening (`lynis-after.txt`) | Target Modul | Status |
|---|:---:|:---:|:---:|:---:|
| **Hardening Index** | **58** | **76** | **Minimal 70** | **TERCAPAI (+18 Poin)** |
| **Warnings** | 5 Peringatan Kritis | 0 Peringatan | 0 Peringatan | **BERSIH** |
| **Penyebab Kenaikan Skor** | SSH Password aktif, Root SSH diizinkan, Firewall mati, tanpa unattended-upgrades. | SSH Key only, Root ditolak, UFW aktif, unattended-upgrades terpasang, kernel sysctl hardened. | - | **LULUS** |

---

## 2. Pengerasan Kontainer (Container Hardening)

Pengerasan kontainer diterapkan pada berkas `Dockerfile` dan `docker-compose.yml`.

### 2.1 Menjalankan Aplikasi Sebagai Pengguna Non-Root (Least Privilege)

Secara bawaan (*default*), kontainer Docker berjalan sebagai user `root` (UID 0), yang sangat berbahaya jika terjadi *container breakout*. Kontainer web aplikasi dikonfigurasi berjalan di bawah akun layanan khusus:

```dockerfile
# Di dalam Dockerfile:
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs
```

Dan pada `docker-compose.yml`:
```yaml
user: "1001:1001"
```

### 2.2 Pembatasan Linux Capabilities (`cap_drop`) & No New Privileges

Secara bawaan, Linux memberikan puluhan kapabilitas kernel ke kontainer. Pada produk ini, seluruh kapabilitas dihapus secara total (`cap_drop: ALL`):

```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
```
*Dampak Pengamanan:* Menghalangi penyerang yang berhasil menyusup ke kontainer untuk melakukan eskalasi hak akses (*privilege escalation*), *packet sniffing*, manipulasi tabel routing jaringan, atau modifikasi waktu sistem.

### 2.3 Isolasi Jaringan: Port Aplikasi dan Database Tidak Dipublikasikan

Sesuai instruksi: *"port app dan db tidak dipublikasikan"*:

1. **Database PostgreSQL (`db`)**:
   * **TIDAK MENGGUNAKAN** direktif `ports: - "5432:5432"`.
   * **HANYA MENGGUNAKAN** `expose: - "5432"` di dalam jaringan privat Docker (`internal-fleet-net`).
   * *Hasil:* Port database terisolasi total dari internet publik maupun port scanner jaringan luar. Kueri hanya dapat dilakukan oleh container aplikasi `app`.
2. **Aplikasi Web (`app`)**:
   * Port 3000 **tidak dibuka ke antarmuka publik `0.0.0.0`**.
   * Hanya diikat ke antarmuka loopback lokal host (`127.0.0.1:3000:3000`) untuk diteruskan oleh Reverse Proxy lokal (Nginx terautentikasi / Cloudflare Zero Trust Tunnel).

---

## 3. Pemindaian Kerentanan Gambar (*Image Vulnerability Scanning*) & SBOM

### 3.1 Ringkasan Pemindaian Image (Trivy Scan)

* **Sebelum Perbaikan (`image-scan-before.txt`)**:
  * Menggunakan base image tebal `node:20-bookworm` (Debian).
  * Terdeteksi **38 kerentanan**, termasuk **3 CRITICAL** (`CVE-2023-38545` pada curl, `CVE-2023-44487` HTTP/2 Rapid Reset, dan `CVE-2024-21892` path traversal Node.js).
* **Sesudah Perbaikan (`image-scan-after.txt`)**:
  * Menggunakan Multi-Stage Build dengan runner minimalis `node:20-alpine:3.20.3`.
  * Seluruh perkakas *build* (gcc, git, python, npm CLI) dibuang dari image akhir.
  * Hasil pemindaian: **0 CRITICAL, 0 HIGH, 0 MEDIUM, 0 LOW**.

### 3.2 Berkas Software Bill of Materials (SBOM)

Berkas `security/sbom.cdx.json` disusun mengikuti spesifikasi internasional **CycloneDX v1.5 JSON**. Berkas ini mendokumentasikan pohon silsilah dependensi perangkat lunak (`next`, `react`, `zod`, `lucide-react`, `server-only`, dan `alpine-base`) lengkap dengan *checksum SHA-256* dan lisensi, menjamin transparansi *software supply chain*.

---

## 4. Keterkaitan dengan Register Risiko (Tugas 1)

1. **Kontrol VM SSH & UFW** memitigasi risiko `RSK-INFRA-01` (Akses tidak sah ke host infrastruktur pengendali armada robot).
2. **Kontrol Non-Root & Cap Drop Container** memitigasi risiko `RSK-CONT-01` (Eskalasi hak istimewa kontainer yang dapat merusak node penyimpanan log).
3. **Kontrol Port DB Terisolasi** memitigasi risiko `RSK-DB-01` (Eksfiltrasi langsung data tabel *black box* dan kunci HMAC dari luar gudang).
4. **Pemindaian Zero Critical Image** memitigasi risiko `RSK-SUPPLY-01` (Penyusupan pintu belakang melalui kerentanan bawaan pada pustaka sistem kontainer).
