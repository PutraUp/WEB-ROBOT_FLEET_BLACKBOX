import { BlackBoxLogEntry, IncidentVerificationDetail } from '../types';

export const GENESIS_PREV_MAC = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Standard serialization for canonical payload string in HMAC computation
 */
export function canonicalizeEntryData(seq: number, ts: string, prev_mac: string, payload: unknown): string {
  // Sort keys to ensure deterministic JSON representation
  const sortedPayloadJson = JSON.stringify(payload, Object.keys(payload as object).sort());
  return `${seq}|${ts}|${prev_mac}|${sortedPayloadJson}`;
}

/**
 * Compute HMAC-SHA256 using Web Crypto API
 */
export async function computeHmacSha256(keyHex: string, message: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyHex);
    const subtle = typeof window !== 'undefined' ? window.crypto?.subtle : globalThis.crypto?.subtle;
    if (!subtle) {
      return fallbackHmacSha256(keyHex, message);
    }
    const cryptoKey = await subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(message)
    );
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Pure JS fallback in case subtle is restricted or unavailable
    return fallbackHmacSha256(keyHex, message);
  }
}

/**
 * Lightweight pure JavaScript HMAC-SHA256 implementation
 */
function fallbackHmacSha256(keyStr: string, message: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function sha256Bytes(bytes: number[]): number[] {
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const originalLen = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) {
      bytes.push(0);
    }
    for (let i = 7; i >= 0; i--) {
      bytes.push((originalLen >>> (i * 8)) & 0xff);
    }

    const W = new Array(64);
    for (let i = 0; i < bytes.length; i += 64) {
      for (let t = 0; t < 16; t++) {
        W[t] = (bytes[i + t * 4] << 24) | (bytes[i + t * 4 + 1] << 16) | (bytes[i + t * 4 + 2] << 8) | (bytes[i + t * 4 + 3]);
      }
      for (let t = 16; t < 64; t++) {
        const s0 = rightRotate(W[t - 15], 7) ^ rightRotate(W[t - 15], 18) ^ (W[t - 15] >>> 3);
        const s1 = rightRotate(W[t - 2], 17) ^ rightRotate(W[t - 2], 19) ^ (W[t - 2] >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
      }

      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const ch = (e & f) ^ ((~e) & g);
        const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
        const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }
      H[0] = (H[0] + a) | 0;
      H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0;
      H[5] = (H[5] + f) | 0;
      H[6] = (H[6] + g) | 0;
      H[7] = (H[7] + h) | 0;
    }

    const out: number[] = [];
    for (let i = 0; i < 8; i++) {
      out.push((H[i] >>> 24) & 0xff, (H[i] >>> 16) & 0xff, (H[i] >>> 8) & 0xff, H[i] & 0xff);
    }
    return out;
  }

  const strToBytes = (s: string) => {
    const bytes: number[] = [];
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      if (code < 128) bytes.push(code);
      else if (code < 2048) {
        bytes.push(192 | (code >> 6), 128 | (code & 63));
      } else {
        bytes.push(224 | (code >> 12), 128 | ((code >> 6) & 63), 128 | (code & 63));
      }
    }
    return bytes;
  };

  const keyBytes = strToBytes(keyStr);
  const msgBytes = strToBytes(message);

  let keyBlock = keyBytes;
  if (keyBlock.length > 64) {
    keyBlock = sha256Bytes(keyBlock);
  }
  while (keyBlock.length < 64) {
    keyBlock.push(0);
  }

  const oKeyPad = keyBlock.map(b => b ^ 0x5c);
  const iKeyPad = keyBlock.map(b => b ^ 0x36);

  const innerHash = sha256Bytes(iKeyPad.concat(msgBytes));
  const outerHash = sha256Bytes(oKeyPad.concat(innerHash));

  return outerHash.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify complete hash chain integrity per SRS crypto/blackbox_log.py
 */
export async function verifyLogChain(
  entries: BlackBoxLogEntry[],
  hmacKey: string,
  expectedHead?: string
): Promise<IncidentVerificationDetail> {
  const verifiedAt = new Date().toISOString();

  if (!entries || entries.length === 0) {
    return {
      verifiedAt,
      isValid: false,
      totalEntriesChecked: 0,
      tamperedSeq: null,
      tamperedField: null,
      expectedMac: null,
      actualMac: null,
      checkpointHeadMatched: false,
      chainIntegrityStatus: 'BROKEN_CHAIN',
      details: 'Log kosong, tidak ada entri untuk diverifikasi.'
    };
  }

  // Iterate sequential check
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // Check 1: Sequence number continuity
    if (i === 0 && entry.seq !== 1) {
      return {
        verifiedAt,
        isValid: false,
        totalEntriesChecked: i,
        tamperedSeq: entry.seq,
        tamperedField: 'seq',
        expectedMac: null,
        actualMac: entry.mac,
        checkpointHeadMatched: false,
        chainIntegrityStatus: 'BROKEN_CHAIN',
        details: `Entri pertama harus memiliki nomor urut 1 (ditemukan seq #${entry.seq})`
      };
    } else if (i > 0 && entry.seq !== entries[i - 1].seq + 1) {
      return {
        verifiedAt,
        isValid: false,
        totalEntriesChecked: i,
        tamperedSeq: entry.seq,
        tamperedField: 'seq',
        expectedMac: null,
        actualMac: entry.mac,
        checkpointHeadMatched: false,
        chainIntegrityStatus: 'BROKEN_CHAIN',
        details: `Nomor urut tidak berurutan pada entri #${entry.seq} (sebelumnya #${entries[i - 1].seq})`
      };
    }

    // Check 2: Previous MAC linking
    if (i === 0) {
      if (entry.prev_mac !== GENESIS_PREV_MAC) {
        return {
          verifiedAt,
          isValid: false,
          totalEntriesChecked: 1,
          tamperedSeq: entry.seq,
          tamperedField: 'prev_mac',
          expectedMac: GENESIS_PREV_MAC,
          actualMac: entry.prev_mac,
          checkpointHeadMatched: false,
          chainIntegrityStatus: 'BROKEN_CHAIN',
          details: `Entri genesis harus memiliki prev_mac 64 nol, tetapi ditemukan prev_mac tidak valid.`
        };
      }
    } else {
      const prevEntryMac = entries[i - 1].mac;
      if (entry.prev_mac !== prevEntryMac) {
        return {
          verifiedAt,
          isValid: false,
          totalEntriesChecked: i + 1,
          tamperedSeq: entry.seq,
          tamperedField: 'prev_mac',
          expectedMac: prevEntryMac,
          actualMac: entry.prev_mac,
          checkpointHeadMatched: false,
          chainIntegrityStatus: 'BROKEN_CHAIN',
          details: `Rantai hash terputus pada entri #${entry.seq}! prev_mac tidak cocok dengan MAC entri #${entries[i - 1].seq}.`
        };
      }
    }

    // Check 3: Cryptographic HMAC signature integrity
    const canonicalData = canonicalizeEntryData(entry.seq, entry.ts, entry.prev_mac, entry.payload);
    const computedMac = await computeHmacSha256(hmacKey, canonicalData);

    if (computedMac.toLowerCase() !== entry.mac.toLowerCase()) {
      return {
        verifiedAt,
        isValid: false,
        totalEntriesChecked: i + 1,
        tamperedSeq: entry.seq,
        tamperedField: 'payload/mac',
        expectedMac: computedMac,
        actualMac: entry.mac,
        checkpointHeadMatched: false,
        chainIntegrityStatus: 'TAMPERED_ENTRY',
        details: `Manipulasi terdeteksi pada Entri #${entry.seq}! Tanda tangan HMAC tidak sesuai dengan isi payload atau timestamp (Data telah diubah oleh peretas).`
      };
    }
  }

  // Check 4: Checkpoint Head comparison (detect truncation)
  const finalEntry = entries[entries.length - 1];
  let checkpointHeadMatched = true;

  if (expectedHead && expectedHead !== finalEntry.mac) {
    checkpointHeadMatched = false;
    return {
      verifiedAt,
      isValid: false,
      totalEntriesChecked: entries.length,
      tamperedSeq: finalEntry.seq,
      tamperedField: 'checkpoint_head',
      expectedMac: expectedHead,
      actualMac: finalEntry.mac,
      checkpointHeadMatched: false,
      chainIntegrityStatus: 'TRUNCATED_LOG',
      details: `Peringatan pemotongan log (Truncation Attack)! MAC head log (${finalEntry.mac.substring(0, 12)}...) tidak cocok dengan Checkpoint server yang tersimpan (${expectedHead.substring(0, 12)}...). Ada entri akhir yang dihapus secara sengaja!`
    };
  }

  return {
    verifiedAt,
    isValid: true,
    totalEntriesChecked: entries.length,
    tamperedSeq: null,
    tamperedField: null,
    expectedMac: finalEntry.mac,
    actualMac: finalEntry.mac,
    checkpointHeadMatched,
    chainIntegrityStatus: 'VERIFIED',
    details: `Semua ${entries.length} entri berhasil diverifikasi. Rantai hash HMAC-SHA256 valid dari Genesis sampai Head Checkpoint.`
  };
}

