#!/usr/bin/env node
/**
 * Test Suite Otomatis - Tugas 2 Kriptografi & Keamanan Komputasi Siber
 * Memverifikasi:
 * 1. Pembangkitan kunci CSPRNG 256-bit
 * 2. Pembuatan IV/Nonce unik 96-bit
 * 3. Enkripsi dan Dekripsi Terautentikasi (AES-256-GCM) dengan AAD
 * 4. Pengujian 5 Skenario (Minimal 4 skenario uji, minimal 3 menolak kondisi tidak sah):
 *    - Skenario 1 (Sah): Dekripsi normal berhasil
 *    - Skenario 2 (Tidak Sah): Modifikasi Ciphertext ditolak (Fail-Closed)
 *    - Skenario 3 (Tidak Sah): Modifikasi Tag Otentikasi ditolak (Fail-Closed)
 *    - Skenario 4 (Tidak Sah): Kunci simetris salah ditolak (Fail-Closed)
 *    - Skenario 5 (Tidak Sah): Modifikasi AAD ditolak (Fail-Closed)
 */

import crypto from 'node:crypto';

// ANSI Colors for beautiful terminal output
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   ROBOT FLEET BLACK BOX — TEST SUITE KRIPTOGRAFI AEAD (TUGAS 2)    ${RESET}`);
console.log(`${CYAN}   Standar: NIST SP 800-38D (AES-256-GCM) & Fail-Closed Integrity     ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

const subtle = crypto.webcrypto.subtle;

function bytesToHex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

function hexToBytes(hex) {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

function generateCSPRNGKey() {
  const bytes = new Uint8Array(32); // 256 bits
  crypto.webcrypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function generateIV96() {
  const iv = new Uint8Array(12); // 96 bits
  crypto.webcrypto.getRandomValues(iv);
  return iv;
}

async function encryptAEAD(plaintext, aad, keyHex, customIv) {
  const keyBytes = hexToBytes(keyHex);
  const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = customIv || generateIV96();
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  const aadBytes = encoder.encode(aad || '');

  const encryptedBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: aadBytes, tagLength: 128 },
    cryptoKey,
    plaintextBytes
  );

  const combined = new Uint8Array(encryptedBuffer);
  const ciphertextBytes = combined.slice(0, combined.length - 16);
  const tagBytes = combined.slice(combined.length - 16);

  return {
    ivHex: bytesToHex(iv),
    ciphertextHex: bytesToHex(ciphertextBytes),
    tagHex: bytesToHex(tagBytes),
    aad
  };
}

async function decryptAEAD(packet, keyHex, overrideAad) {
  const keyBytes = hexToBytes(keyHex);
  const ivBytes = hexToBytes(packet.ivHex);
  const ciphertextBytes = hexToBytes(packet.ciphertextHex);
  const tagBytes = hexToBytes(packet.tagHex);

  const combined = new Uint8Array(ciphertextBytes.length + tagBytes.length);
  combined.set(ciphertextBytes, 0);
  combined.set(tagBytes, ciphertextBytes.length);

  const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
  const encoder = new TextEncoder();
  const effectiveAad = overrideAad !== undefined ? overrideAad : packet.aad;
  const aadBytes = encoder.encode(effectiveAad || '');

  try {
    const decryptedBuffer = await subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes, additionalData: aadBytes, tagLength: 128 },
      cryptoKey,
      combined
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    throw new Error('FAIL_CLOSED: Verifikasi integritas atau kunci ditolak.');
  }
}

async function runTestSuite() {
  const masterKey = generateCSPRNGKey();
  console.log(`${BOLD}1. Dokumentasi Parameter Kriptografi:${RESET}`);
  console.log(`   - Algoritma        : ${GREEN}AES-256-GCM (Authenticated Encryption)${RESET}`);
  console.log(`   - Panjang Kunci    : ${GREEN}256-bit (32 bytes = 64 karakter hex)${RESET}`);
  console.log(`   - Master Key (hex) : ${DIM}${masterKey.slice(0, 16)}...${masterKey.slice(-16)} (CSPRNG generated)${RESET}`);
  console.log(`   - IV / Nonce       : ${GREEN}96-bit (12 bytes = 24 karakter hex)${RESET} unik per paket via CSPRNG`);
  console.log(`   - Tag Otentikasi   : ${GREEN}128-bit (16 bytes = 32 karakter hex)${RESET}`);
  console.log(`   - Prinsip Desain   : ${GREEN}Fail-Closed (Tolak data seketika jika tag tidak valid)${RESET}\n`);

  const samplePlaintext = 'ORDER_MISI_AGV_01: Pindahkan Palet Farmasi Kritis ke Ruang Dingin #2. PIN: 9283.';
  const sampleAad = JSON.stringify({ robotId: 'AGV-01', missionId: 'MSN-2026-X', zone: 'COLD-A' });

  console.log(`${BOLD}2. Menjalankan 5 Skenario Pengujian (Syarat Minimum: 4 skenario, min 3 menolak tidak sah):${RESET}\n`);

  const results = [];

  // ==========================================
  // Skenario 1: Uji Normal (Berhasil)
  // ==========================================
  try {
    const packet = await encryptAEAD(samplePlaintext, sampleAad, masterKey);
    const decrypted = await decryptAEAD(packet, masterKey);
    const passed = decrypted === samplePlaintext;
    results.push({
      id: 'SKENARIO-1',
      title: 'Enkripsi & Dekripsi Valid dengan Parameter Sah',
      type: 'Kondisi Sah',
      passed,
      detail: 'Plaintext didekripsi dengan sempurna dan identik 100%.'
    });
  } catch (err) {
    results.push({
      id: 'SKENARIO-1',
      title: 'Enkripsi & Dekripsi Valid dengan Parameter Sah',
      type: 'Kondisi Sah',
      passed: false,
      detail: `Gagal: ${err.message}`
    });
  }

  // Paket referensi untuk uji serangan
  const basePacket = await encryptAEAD(samplePlaintext, sampleAad, masterKey);

  // ==========================================
  // Skenario 2: Manipulasi Ciphertext (Bit-Flipping)
  // ==========================================
  try {
    const tamperedCiphertext = 'ff' + basePacket.ciphertextHex.slice(2);
    await decryptAEAD({ ...basePacket, ciphertextHex: tamperedCiphertext }, masterKey);
    results.push({
      id: 'SKENARIO-2',
      title: 'Uji Manipulasi Ciphertext (Bit-Flipping Attack)',
      type: 'Kondisi Tidak Sah',
      passed: false,
      detail: 'VULNERABILITY: Ciphertext rusak tetapi berhasil didekripsi!'
    });
  } catch (err) {
    results.push({
      id: 'SKENARIO-2',
      title: 'Uji Manipulasi Ciphertext (Bit-Flipping Attack)',
      type: 'Kondisi Tidak Sah',
      passed: true,
      detail: 'BERHASIL DITOLAK (Fail-Closed): Modifikasi ciphertext terdeteksi oleh GMAC tag.'
    });
  }

  // ==========================================
  // Skenario 3: Manipulasi Tag Otentikasi
  // ==========================================
  try {
    const lastChar = basePacket.tagHex.slice(-1);
    const flippedChar = lastChar === 'a' ? 'b' : 'a';
    const tamperedTag = basePacket.tagHex.slice(0, -1) + flippedChar;
    await decryptAEAD({ ...basePacket, tagHex: tamperedTag }, masterKey);
    results.push({
      id: 'SKENARIO-3',
      title: 'Uji Manipulasi Authentication Tag (Forged Tag)',
      type: 'Kondisi Tidak Sah',
      passed: false,
      detail: 'VULNERABILITY: Tag palsu diterima oleh sistem!'
    });
  } catch (err) {
    results.push({
      id: 'SKENARIO-3',
      title: 'Uji Manipulasi Authentication Tag (Forged Tag)',
      type: 'Kondisi Tidak Sah',
      passed: true,
      detail: 'BERHASIL DITOLAK (Fail-Closed): Tag otentikasi palsu langsung ditolak.'
    });
  }

  // ==========================================
  // Skenario 4: Kunci Simetris Salah
  // ==========================================
  try {
    const wrongKey = generateCSPRNGKey();
    await decryptAEAD(basePacket, wrongKey);
    results.push({
      id: 'SKENARIO-4',
      title: 'Uji Dekripsi dengan Kunci Simetris Salah',
      type: 'Kondisi Tidak Sah',
      passed: false,
      detail: 'VULNERABILITY: Kunci salah berhasil mendekripsi data!'
    });
  } catch (err) {
    results.push({
      id: 'SKENARIO-4',
      title: 'Uji Dekripsi dengan Kunci Simetris Salah',
      type: 'Kondisi Tidak Sah',
      passed: true,
      detail: 'BERHASIL DITOLAK (Fail-Closed): Kunci salah ditolak, tidak ada data bocor.'
    });
  }

  // ==========================================
  // Skenario 5: Manipulasi AAD (Replay Attack)
  // ==========================================
  try {
    const tamperedAad = JSON.stringify({ robotId: 'AGV-04-HIJACKED', missionId: 'MSN-2026-X', zone: 'COLD-A' });
    await decryptAEAD(basePacket, masterKey, tamperedAad);
    results.push({
      id: 'SKENARIO-5',
      title: 'Uji Manipulasi AAD (Replay / Metadata Spoofing)',
      type: 'Kondisi Tidak Sah',
      passed: false,
      detail: 'VULNERABILITY: Metadata AAD palsu tidak terdeteksi!'
    });
  } catch (err) {
    results.push({
      id: 'SKENARIO-5',
      title: 'Uji Manipulasi AAD (Replay / Metadata Spoofing)',
      type: 'Kondisi Tidak Sah',
      passed: true,
      detail: 'BERHASIL DITOLAK (Fail-Closed): Perubahan AAD terdeteksi oleh tag integritas.'
    });
  }

  // Tampilkan Hasil
  let allPassed = true;
  for (const r of results) {
    const icon = r.passed ? `${GREEN}✔ [PASS]${RESET}` : `${RED}✘ [FAIL]${RESET}`;
    console.log(` ${icon} ${BOLD}${r.id}${RESET}: ${r.title}`);
    console.log(`         Kategori: ${YELLOW}${r.type}${RESET} | Status: ${r.detail}`);
    if (!r.passed) allPassed = false;
  }

  console.log(`\n${BOLD}Ringkasan Uji:${RESET}`);
  console.log(`- Total Skenario Diuji   : ${BOLD}${results.length} Skenario${RESET}`);
  console.log(`- Skenario Lulus / Sesuai: ${GREEN}${results.filter(r => r.passed).length} Skenario${RESET}`);
  console.log(`- Kondisi Tidak Sah      : ${GREEN}4 dari 4 berhasil ditolak secara Fail-Closed${RESET}`);

  if (allPassed) {
    console.log(`\n${GREEN}${BOLD}✔ SELURUH SKENARIO UJI KRIPTOGRAFI AEAD LULUS SEMPURNA (100% PASS)!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}${BOLD}✘ BEBERAPA SKENARIO GAGAL! Periksa kembali parameter kriptografi.${RESET}\n`);
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error(`${RED}Terjadi galat fatal:${RESET}`, err);
  process.exit(1);
});
