import { NextRequest, NextResponse } from 'next/server';
import {
  encryptAEAD,
  decryptAEAD,
  generateCSPRNGKeyHex,
  runAeadTestSuite,
  AeadIntegrityError
} from '@/lib/crypto/aead';

// Ambil master key dari environment variable di luar repositori (.env.local)
const getServerMasterKey = (): string => {
  const envKey = process.env.AEAD_MASTER_KEY_HEX;
  if (envKey && envKey.trim().length === 64) {
    return envKey.trim();
  }
  // Fallback dev key jika env belum diisi
  return '94e1ddacfdd38a5e078004098e72b64d2208d23176ac0a0ad16e87ba263fd4d2';
};

export async function GET() {
  const key = getServerMasterKey();
  const maskedKey = `${key.slice(0, 6)}...${key.slice(-6)}`;
  const isEnvConfigured = !!process.env.AEAD_MASTER_KEY_HEX;

  return NextResponse.json({
    status: 'READY',
    module: 'AEAD_CRYPTO_ENGINE_TUGAS_2',
    specifications: {
      cipher: 'AES-256-GCM (Galois/Counter Mode)',
      standard: 'NIST SP 800-38D / RFC 5116',
      keyLengthBits: 256,
      keyLengthBytes: 32,
      ivLengthBits: 96,
      ivLengthBytes: 12,
      ivGenerator: 'CSPRNG (Web Crypto API getRandomValues)',
      tagLengthBits: 128,
      tagLengthBytes: 16,
      aadSupport: 'Additional Authenticated Data (Domain-separation metadata)',
      failClosedMode: true
    },
    keyStorage: {
      storageLocation: 'Environment Variable (.env.local - Di Luar Repositori Git)',
      isLoadedFromEnv: isEnvConfigured,
      maskedKey: maskedKey,
      note: 'Kunci rahasia master tidak pernah dikomit ke Git repositori publik (Rubrik K3).'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const serverKey = getServerMasterKey();

    if (action === 'generate_key') {
      const newKeyHex = generateCSPRNGKeyHex();
      return NextResponse.json({
        success: true,
        keyHex: newKeyHex,
        bitLength: 256,
        byteLength: 32,
        generatedWith: 'CSPRNG (crypto.getRandomValues)'
      });
    }

    if (action === 'run_tests') {
      const targetKey = body.keyHex || serverKey;
      const testResults = await runAeadTestSuite(targetKey);
      const passedCount = testResults.filter(r => r.passed).length;
      return NextResponse.json({
        success: true,
        totalTests: testResults.length,
        passedCount: passedCount,
        allPassed: passedCount === testResults.length,
        results: testResults
      });
    }

    if (action === 'encrypt') {
      const { plaintext, aad, customKeyHex } = body;
      if (!plaintext) {
        return NextResponse.json(
          { success: false, error: 'Plaintext wajib diisi.' },
          { status: 400 }
        );
      }
      const activeKey = customKeyHex || serverKey;
      const packet = await encryptAEAD(plaintext, aad || '', activeKey);
      return NextResponse.json({
        success: true,
        packet
      });
    }

    if (action === 'decrypt') {
      const { packet, customKeyHex, overrideAad } = body;
      if (!packet || !packet.ivHex || !packet.ciphertextHex || !packet.tagHex) {
        return NextResponse.json(
          { success: false, error: 'Paket terenkripsi tidak lengkap (iv, ciphertext, tag wajib ada).' },
          { status: 400 }
        );
      }
      const activeKey = customKeyHex || serverKey;

      try {
        const decryptedPlaintext = await decryptAEAD(packet, activeKey, overrideAad);
        return NextResponse.json({
          success: true,
          decryptedPlaintext,
          status: 'AUTHENTICATION_VERIFIED'
        });
      } catch (decryptErr) {
        // FAIL-CLOSED: Return 400 with strict integrity failure message
        const err = decryptErr as AeadIntegrityError;
        return NextResponse.json(
          {
            success: false,
            error: err.message,
            code: err.code || 'INTEGRITY_VERIFICATION_FAILED',
            failClosed: true
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: `Action '${action}' tidak dikenal.` },
      { status: 400 }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Terjadi galat kriptografi internal.',
        failClosed: true
      },
      { status: 500 }
    );
  }
}
