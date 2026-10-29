/**
 * AEAD (Authenticated Encryption with Associated Data) Engine
 * Tugas 2 - Kriptografi, Pemweb & Keamanan Komputasi dan Siber
 *
 * Standar: NIST SP 800-38D (Galois/Counter Mode - AES-GCM)
 * Parameter:
 * - Cipher: AES-256-GCM
 * - Kunci: 256-bit (32 bytes) dibangkitkan via CSPRNG
 * - IV / Nonce: 96-bit (12 bytes) unik per enkripsi via CSPRNG (NIST SP 800-38D §8.2)
 * - Tag: 128-bit (16 bytes) Authentication Tag
 * - AAD: Additional Authenticated Data (metadata publik yang diotentikasi)
 * - Prinsip: Fail-Closed (Gagal Tertutup pada kesalahan integritas atau kunci)
 */

export interface AeadEncryptedPacket {
  algorithm: 'AES-256-GCM';
  keyLengthBits: 256;
  ivHex: string;          // 96-bit (24 karakter hex)
  ciphertextHex: string;  // Ciphertext terenkripsi
  tagHex: string;         // 128-bit (32 karakter hex)
  aad: string;            // Additional Authenticated Data plaintext
  timestamp: string;      // Waktu enkripsi ISO-8601
}

export interface AeadTestResult {
  id: string;
  name: string;
  category: 'VALID' | 'TAMPER_CIPHERTEXT' | 'TAMPER_TAG' | 'WRONG_KEY' | 'TAMPER_AAD';
  description: string;
  expectedBehavior: 'DECRYPT_SUCCESS' | 'FAIL_CLOSED_REJECTED';
  passed: boolean;
  actualStatus: string;
  errorMessage?: string;
  executionTimeMs: number;
}

export class AeadIntegrityError extends Error {
  public readonly code: string;
  constructor(message: string, code = 'AEAD_AUTH_FAILED') {
    super(message);
    this.name = 'AeadIntegrityError';
    this.code = code;
  }
}

// Helper: Konversi Uint8Array ke Hex String
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Konversi Hex String ke Uint8Array
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.trim().toLowerCase();
  if (cleanHex.length % 2 !== 0) {
    throw new AeadIntegrityError('Panjang string hex tidak valid (harus genap).', 'INVALID_HEX');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    const byte = parseInt(cleanHex.substring(i, i + 2), 16);
    if (isNaN(byte)) {
      throw new AeadIntegrityError(`Karakter hex tidak valid pada posisi ${i}: ${cleanHex.substring(i, i + 2)}`, 'INVALID_HEX');
    }
    bytes[i / 2] = byte;
  }
  return bytes;
}

/**
 * Memperoleh instance SubtleCrypto baik di browser maupun di Node.js runtime.
 */
function getSubtleCrypto(): SubtleCrypto {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new AeadIntegrityError('SubtleCrypto API tidak tersedia di lingkungan runtime ini.', 'CRYPTO_UNAVAILABLE');
}

/**
 * Bangkitkan kunci acak 256-bit (32 bytes) menggunakan CSPRNG.
 * Memenuhi ketentuan: "Kunci dibangkitkan dengan CSPRNG"
 */
export function generateCSPRNGKeyHex(): string {
  const bytes = new Uint8Array(32); // 256 bits
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    throw new AeadIntegrityError('CSPRNG tidak tersedia untuk pembangkitan kunci acak.', 'CSPRNG_UNAVAILABLE');
  }
  return bytesToHex(bytes);
}

/**
 * Bangkitkan IV / Nonce unik 96-bit (12 bytes) menggunakan CSPRNG.
 * Standar NIST SP 800-38D merekomendasikan tepat 96 bit untuk efisiensi dan keamanan mode GCM.
 */
export function generateUniqueIV96(): Uint8Array {
  const iv = new Uint8Array(12); // 96 bits
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(iv);
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(iv);
  } else {
    throw new AeadIntegrityError('CSPRNG tidak tersedia untuk pembangkitan IV unik.', 'CSPRNG_UNAVAILABLE');
  }
  return iv;
}

/**
 * Validasi parameter masukan (Rubrik K3 - Penanganan masukan).
 * Memastikan panjang kunci tepat 256-bit (64 hex) dan input valid.
 */
export function validateKeyHex(keyHex: string): void {
  if (!keyHex || typeof keyHex !== 'string') {
    throw new AeadIntegrityError('Kunci enkripsi tidak boleh kosong.', 'EMPTY_KEY');
  }
  const clean = keyHex.trim();
  if (clean.length !== 64) {
    throw new AeadIntegrityError(
      `Panjang kunci tidak valid: ditemukan ${clean.length} karakter hex (${clean.length * 4} bit). Wajib 64 karakter hex (256-bit).`,
      'INVALID_KEY_LENGTH'
    );
  }
  // Validasi karakter hex
  if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
    throw new AeadIntegrityError('Format kunci mengandung karakter non-heksadesimal yang tidak sah.', 'MALFORMED_KEY_HEX');
  }
}

/**
 * Enkripsi Terautentikasi AEAD menggunakan AES-256-GCM.
 *
 * @param plaintext Teks rahasia yang akan dienkripsi (Confidentiality)
 * @param aad Associated Data publik (diotentikasi, tidak dienkripsi)
 * @param keyHex Kunci simetris 256-bit (64 hex characters)
 * @param customIv Optional custom IV untuk pengujian replikasi
 */
export async function encryptAEAD(
  plaintext: string,
  aad: string,
  keyHex: string,
  customIv?: Uint8Array
): Promise<AeadEncryptedPacket> {
  // 1. Validasi masukan (Fail-closed)
  validateKeyHex(keyHex);
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new AeadIntegrityError('Plaintext tidak boleh kosong.', 'EMPTY_PLAINTEXT');
  }

  const subtle = getSubtleCrypto();
  const keyBytes = hexToBytes(keyHex);

  // 2. Import Kunci ke SubtleCrypto
  const cryptoKey = await subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // 3. Bangkitkan IV/Nonce 96-bit (12 bytes) CSPRNG jika tidak disediakan
  const iv = customIv ?? generateUniqueIV96();
  if (iv.length !== 12) {
    throw new AeadIntegrityError('Panjang IV/Nonce untuk AES-GCM wajib 96-bit (12 bytes).', 'INVALID_IV_LENGTH');
  }

  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  const aadBytes = encoder.encode(aad || '');

  // 4. Enkripsi AES-GCM dengan tagLength 128-bit
  // SubtleCrypto AES-GCM secara otomatis menggabungkan ciphertext + 16 bytes tag pada akhir buffer
  const encryptedBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      additionalData: aadBytes as unknown as BufferSource,
      tagLength: 128 // 128-bit authentication tag
    },
    cryptoKey,
    plaintextBytes as unknown as BufferSource
  );

  const combinedBytes = new Uint8Array(encryptedBuffer);
  // Pisahkan ciphertext dan 16-byte authentication tag
  const tagBytesLength = 16;
  const ciphertextBytes = combinedBytes.slice(0, combinedBytes.length - tagBytesLength);
  const tagBytes = combinedBytes.slice(combinedBytes.length - tagBytesLength);

  return {
    algorithm: 'AES-256-GCM',
    keyLengthBits: 256,
    ivHex: bytesToHex(iv),
    ciphertextHex: bytesToHex(ciphertextBytes),
    tagHex: bytesToHex(tagBytes),
    aad: aad,
    timestamp: new Date().toISOString()
  };
}

/**
 * Dekripsi Terautentikasi AEAD menggunakan AES-256-GCM.
 * Bersifat GAGAL TERTUTUP (FAIL-CLOSED): jika ada perubahan 1 bit pada ciphertext,
 * tag, AAD, atau jika kunci salah, sistem menolak seluruh paket tanpa membocorkan plaintext!
 *
 * @param packet Paket terenkripsi (ivHex, ciphertextHex, tagHex, aad)
 * @param keyHex Kunci simetris 256-bit (64 hex characters)
 * @param overrideAad Optional override AAD untuk simulasi serangan tamper AAD
 */
export async function decryptAEAD(
  packet: Pick<AeadEncryptedPacket, 'ivHex' | 'ciphertextHex' | 'tagHex' | 'aad'>,
  keyHex: string,
  overrideAad?: string
): Promise<string> {
  // 1. Validasi masukan
  validateKeyHex(keyHex);
  if (!packet.ivHex || !packet.ciphertextHex || !packet.tagHex) {
    throw new AeadIntegrityError('Paket terenkripsi tidak lengkap: ivHex, ciphertextHex, dan tagHex wajib ada.', 'INCOMPLETE_PACKET');
  }

  const subtle = getSubtleCrypto();
  const keyBytes = hexToBytes(keyHex);
  const ivBytes = hexToBytes(packet.ivHex);
  const ciphertextBytes = hexToBytes(packet.ciphertextHex);
  const tagBytes = hexToBytes(packet.tagHex);

  if (ivBytes.length !== 12) {
    throw new AeadIntegrityError('Panjang IV tidak valid: wajib 12 bytes (96 bit).', 'INVALID_IV_LENGTH');
  }
  if (tagBytes.length !== 16) {
    throw new AeadIntegrityError('Panjang Authentication Tag tidak valid: wajib 16 bytes (128 bit).', 'INVALID_TAG_LENGTH');
  }

  // 2. Gabungkan kembali ciphertext + tag untuk SubtleCrypto AES-GCM
  const combinedBytes = new Uint8Array(ciphertextBytes.length + tagBytes.length);
  combinedBytes.set(ciphertextBytes, 0);
  combinedBytes.set(tagBytes, ciphertextBytes.length);

  // 3. Import Kunci Dekripsi
  const cryptoKey = await subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const encoder = new TextEncoder();
  const effectiveAad = overrideAad !== undefined ? overrideAad : packet.aad;
  const aadBytes = encoder.encode(effectiveAad || '');

  // 4. Dekripsi & Verifikasi Integritas Atomik
  try {
    const decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes as unknown as BufferSource,
        additionalData: aadBytes as unknown as BufferSource,
        tagLength: 128
      },
      cryptoKey,
      combinedBytes as unknown as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    // FAIL-CLOSED: Jangan pernah mengembalikan potongan plaintext jika verifikasi tag gagal!
    throw new AeadIntegrityError(
      'Gagal Tertutup (Fail-Closed): Autentikasi integritas data gagal! Ciphertext, Tag autentikasi, AAD tidak cocok, atau kunci simetris salah.',
      'AUTHENTICATION_FAILED_FAIL_CLOSED'
    );
  }
}

/**
 * Suite Pengujian Otomatis 5 Skenario AEAD:
 * Memenuhi Ketentuan Minimum:
 * - Minimal 4 skenario uji, minimal 3 berhasil menolak kondisi tidak sah.
 * - Skenario 1: Dekripsi Valid (Berhasil)
 * - Skenario 2: Modifikasi Ciphertext (Ditolak / Fail-Closed)
 * - Skenario 3: Modifikasi Authentication Tag (Ditolak / Fail-Closed)
 * - Skenario 4: Kunci Salah (Ditolak / Fail-Closed)
 * - Skenario 5: Modifikasi AAD / Replay Robot Target (Ditolak / Fail-Closed)
 */
export async function runAeadTestSuite(customKeyHex?: string): Promise<AeadTestResult[]> {
  const masterKey = customKeyHex && customKeyHex.length === 64 ? customKeyHex : generateCSPRNGKeyHex();
  const samplePlaintext = 'INSTRUKSI_MISI_RAHASIA: Evakuasi Palet Vaksin Pfizer Batch-77A ke Ruang Pendingin B-04. PIN Vault: 8941.';
  const sampleAad = JSON.stringify({
    robotId: 'AGV-01',
    missionSeq: 42,
    sector: 'ZONE-A-COLDSTORAGE',
    authorizedBy: 'ADMIN_CHIEF_DISPATCHER'
  });

  const results: AeadTestResult[] = [];

  // ==========================================================================
  // Skenario 1: Uji Validitas Normal (Harus Berhasil)
  // ==========================================================================
  const t1Start = performance.now();
  try {
    const packet = await encryptAEAD(samplePlaintext, sampleAad, masterKey);
    const decrypted = await decryptAEAD(packet, masterKey);
    const isMatched = decrypted === samplePlaintext;
    results.push({
      id: 'TC-01',
      name: 'Dekripsi Valid dengan Semua Parameter Sah',
      category: 'VALID',
      description: 'Enkripsi & dekripsi dengan Kunci CSPRNG, IV 96-bit, AAD, dan Tag 128-bit yang sah.',
      expectedBehavior: 'DECRYPT_SUCCESS',
      passed: isMatched,
      actualStatus: isMatched ? 'SUKSES: Plaintext terdekripsi utuh dan identik' : 'GAGAL: Plaintext tidak cocok',
      executionTimeMs: Math.round(performance.now() - t1Start)
    });
  } catch (err) {
    results.push({
      id: 'TC-01',
      name: 'Dekripsi Valid dengan Semua Parameter Sah',
      category: 'VALID',
      description: 'Enkripsi & dekripsi dengan parameter valid.',
      expectedBehavior: 'DECRYPT_SUCCESS',
      passed: false,
      actualStatus: 'GAGAL: Mengalami eksepsi tak terduga',
      errorMessage: (err as Error).message,
      executionTimeMs: Math.round(performance.now() - t1Start)
    });
  }

  // Siapkan paket asli untuk skenario pengujian kondisi tidak sah
  const basePacket = await encryptAEAD(samplePlaintext, sampleAad, masterKey);

  // ==========================================================================
  // Skenario 2: Manipulasi Ciphertext (Bit-Flipping Attack) -> Wajib Ditolak
  // ==========================================================================
  const t2Start = performance.now();
  try {
    // Ubah 1 karakter hex pada ciphertext
    const tamperedCiphertext =
      basePacket.ciphertextHex.slice(0, 4) === '0000'
        ? 'ffff' + basePacket.ciphertextHex.slice(4)
        : '0000' + basePacket.ciphertextHex.slice(4);

    await decryptAEAD(
      {
        ...basePacket,
        ciphertextHex: tamperedCiphertext
      },
      masterKey
    );

    // Jika sampai di sini tanpa error, berarti sistem TIDAK gagal tertutup (FATAL VULNERABILITY!)
    results.push({
      id: 'TC-02',
      name: 'Uji Integritas Ciphertext (Deteksi Bit-Flipping)',
      category: 'TAMPER_CIPHERTEXT',
      description: 'Ciphertext dimanipulasi 4-byte oleh penyerang. Sistem harus menolak dekripsi.',
      expectedBehavior: 'FAIL_CLOSED_REJECTED',
      passed: false,
      actualStatus: 'GAGAL KRITIS: Ciphertext yang dirusak tidak ditolak!',
      executionTimeMs: Math.round(performance.now() - t2Start)
    });
  } catch (err) {
    const isIntegrityError = err instanceof AeadIntegrityError || (err as Error).name === 'AeadIntegrityError';
    results.push({
      id: 'TC-02',
      name: 'Uji Integritas Ciphertext (Deteksi Bit-Flipping)',
      category: 'TAMPER_CIPHERTEXT',
      description: 'Ciphertext dimanipulasi oleh penyerang. Sistem wajib gagal tertutup.',
      expectedBehavior: 'FAIL_CLOSED_REJECTED',
      passed: isIntegrityError,
      actualStatus: 'DITOLAK SECARA AMAN (Fail-Closed): Manipulasi ciphertext terdeteksi oleh tag GMAC.',
      errorMessage: (err as Error).message,
      executionTimeMs: Math.round(performance.now() - t2Start)
    });
  }

  // ==========================================================================
  // Skenario 3: Manipulasi Authentication Tag -> Wajib Ditolak
  // ==========================================================================
  const t3Start = performance.now();
  try {
    // Ubah karakter terakhir tag
    const lastChar = basePacket.tagHex.slice(-1);
    const flippedChar = lastChar === 'a' ? 'b' : 'a';
    const tamperedTag = basePacket.tagHex.slice(0, -1) + flippedChar;

    await decryptAEAD(
      {
        ...basePacket,
        tagHex: tamperedTag
      },
      masterKey
    );

    results.push({
      id: 'TC-03',
      name: 'Uji Modifikasi Authentication Tag (Forged Tag)',
      category: 'TAMPER_TAG',
      description: 'Tag otentikasi dipalsukan 1 karakter hex. Sistem wajib menolak.',
      expectedBehavior: 'FAIL_CLOSED_REJECTED',
      passed: false,
      actualStatus: 'GAGAL KRITIS: Tag palsu berhasil lolos verifikasi!',
      executionTimeMs: Math.round(performance.now() - t3Start)
    });
  } catch (err) {
    results.push({
      id: 'TC-03',
      name: 'Uji Modifikasi Authentication Tag (Forged Tag)',
      category: 'TAMPER_TAG',
      description: 'Tag otentikasi dipalsukan 1 karakter hex. Sistem wajib menolak.',
      expectedBehavior: 'FAIL_CLOSED_REJECTED',
      passed: true,
      actualStatus: 'DITOLAK SECARA AMAN (Fail-Closed): Tag otentikasi tidak sah ditolak oleh Web Crypto API.',
      errorMessage: (err as Error).message,
      executionTimeMs: Math.round(performance.now() - t3Start)
    });
  }

  // ==========================================================================
  // Skenario 4: Dekripsi dengan Kunci Salah (Wrong Symmetric Key) -> Wajib Ditolak
  // ==========================================================================
  const t4Start = performance.now();
  try {
    const wrongKey = generateCSPRNGKeyHex();
    await decryptAEAD(basePacket, wrongKey);

    results.push({
      id: 'TC-04',
      name: 'Uji Kunci Tidak Sah (Wrong Pre-Shared Key)',
      category: 'WRONG_KEY',
      description: 'Dekripsi dicoba menggunakan kunci simetris 256-bit lain yang tidak sah.',
      expectedBehavior: 'FAIL_CLOSED_REJECTED',
      passed: false,
      actualStatus: 'GAGAL KRITIS: Kunci salah berhasil mendekripsi data!',
      executionTimeMs: Math.round(performance.now() - t4Start)
    });
  } catch (err) {
    results.push({
      id: 'TC-04',
      name: 'Uji Kunci Tidak Sah (Wrong Pre-Shared Key)',
      category: 'WRONG_KEY',
      description: 'Dekripsi dicoba menggunakan kunci simetris lain yang tidak sah.',
      expectedBehavior: 'FAIL_CLOSED_REJECTED',
      passed: true,
      actualStatus: 'DITOLAK SECARA AMAN (Fail-Closed): Kunci salah ditolak, tidak ada kebocoran plaintext.',
      errorMessage: (err as Error).message,
      executionTimeMs: Math.round(performance.now() - t4Start)
    });
  }

  // ==========================================================================
  // Skenario 5 (Bonus): Manipulasi AAD / Associated Data (Replay Attack) -> Wajib Ditolak
  // ==========================================================================
  const t5Start = performance.now();
  try {
    // Penyerang menukar target robot dari AGV-01 ke AGV-04 pada metadata AAD
    const tamperedAad = JSON.stringify({
      robotId: 'AGV-04-HIJACKED',
      missionSeq: 42,
      sector: 'ZONE-A-COLDSTORAGE',
      authorizedBy: 'ADMIN_CHIEF_DISPATCHER'
    });

    await decryptAEAD(basePacket, masterKey, tamperedAad);

    results.push({
      id: 'TC-05',
      name: 'Uji Manipulasi AAD (Replay / Metadata Spoofing)',
      category: 'TAMPER_AAD',
      description: 'Metadata AAD ditukar (robotId diubah ke unit lain). Sistem wajib mendeteksi ketidakcocokan tag.',
      expectedBehavior: 'FAIL_CLOSED_REJECTED',
      passed: false,
      actualStatus: 'GAGAL KRITIS: Perubahan metadata AAD tidak terdeteksi!',
      executionTimeMs: Math.round(performance.now() - t5Start)
    });
  } catch (err) {
    results.push({
      id: 'TC-05',
      name: 'Uji Manipulasi AAD (Replay / Metadata Spoofing)',
      category: 'TAMPER_AAD',
      description: 'Metadata AAD ditukar ke target lain. Sistem wajib mendeteksi perubahan.',
      expectedBehavior: 'FAIL_CLOSED_REJECTED',
      passed: true,
      actualStatus: 'DITOLAK SECARA AMAN (Fail-Closed): Perubahan AAD mengubah kalkulasi GHASH sehingga tag tidak cocok.',
      errorMessage: (err as Error).message,
      executionTimeMs: Math.round(performance.now() - t5Start)
    });
  }

  return results;
}
