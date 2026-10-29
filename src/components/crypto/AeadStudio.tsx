'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  RefreshCw,
  Play,
  Copy,
  Check,
  AlertTriangle,
  FileCode,
  Terminal,
  Zap,
  Info,
  Server,
  Layers,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  encryptAEAD,
  decryptAEAD,
  generateCSPRNGKeyHex,
  runAeadTestSuite,
  AeadEncryptedPacket,
  AeadTestResult
} from '../../lib/crypto/aead';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';

export const AeadStudio: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'lab' | 'tests' | 'keys' | 'guide'>('lab');

  // Key state
  const [activeKeyHex, setActiveKeyHex] = useState<string>('');
  const [keyCopied, setKeyCopied] = useState<boolean>(false);
  const [packetCopied, setPacketCopied] = useState<boolean>(false);

  // Form input for Encryption
  const [plaintextInput, setPlaintextInput] = useState<string>(
    'ORDER_MISI_AGV_01: Evakuasi 20 Palet Vaksin Suhu Dingin (-80°C) ke Cold Storage Bay B-04. PIN Otorisasi Vault: 8941.'
  );
  const [aadInput, setAadInput] = useState<string>(
    JSON.stringify(
      {
        robotId: 'AGV-01',
        missionSeq: 42,
        zone: 'COLD-STORAGE-A',
        dispatchTimestamp: '2026-10-28T12:00:00Z',
        org: 'LOGISTICS-CORP'
      },
      null,
      2
    )
  );

  // Encrypted state
  const [encryptedPacket, setEncryptedPacket] = useState<AeadEncryptedPacket | null>(null);
  const [originalPacket, setOriginalPacket] = useState<AeadEncryptedPacket | null>(null);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);

  // Decryption state & result
  const [decryptResult, setDecryptResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    text?: string;
    errorMsg?: string;
    failClosed?: boolean;
    durationMs?: number;
  }>({ status: 'IDLE' });

  // Tamper indicators
  const [tamperState, setTamperState] = useState<{
    ciphertext: boolean;
    tag: boolean;
    aad: boolean;
    wrongKey: boolean;
  }>({
    ciphertext: false,
    tag: false,
    aad: false,
    wrongKey: false
  });

  // Automated Test Suite State
  const [testResults, setTestResults] = useState<AeadTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [testsExecuted, setTestsExecuted] = useState<boolean>(false);

  // Initialize with CSPRNG key on mount
  useEffect(() => {
    const initKey = generateCSPRNGKeyHex();
    setActiveKeyHex(initKey);
  }, []);

  // Handle Generate new CSPRNG key
  const handleRegenerateKey = () => {
    const newKey = generateCSPRNGKeyHex();
    setActiveKeyHex(newKey);
    setDecryptResult({ status: 'IDLE' });
    // Reset tamper state
    setTamperState({ ciphertext: false, tag: false, aad: false, wrongKey: false });
  };

  const handleCopyKey = () => {
    if (!activeKeyHex) return;
    navigator.clipboard.writeText(activeKeyHex);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleCopyPacket = () => {
    if (!encryptedPacket) return;
    navigator.clipboard.writeText(JSON.stringify(encryptedPacket, null, 2));
    setPacketCopied(true);
    setTimeout(() => setPacketCopied(false), 2000);
  };

  // Perform AEAD Encryption
  const handleEncrypt = async () => {
    if (!plaintextInput.trim()) return;
    setIsEncrypting(true);
    setDecryptResult({ status: 'IDLE' });
    try {
      const packet = await encryptAEAD(plaintextInput, aadInput, activeKeyHex);
      setEncryptedPacket(packet);
      setOriginalPacket({ ...packet });
      setTamperState({ ciphertext: false, tag: false, aad: false, wrongKey: false });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Perform AEAD Decryption
  const handleDecrypt = async (useWrongKey = false) => {
    if (!encryptedPacket) return;
    const start = performance.now();
    const effectiveKey = useWrongKey ? generateCSPRNGKeyHex() : activeKeyHex;

    try {
      const decrypted = await decryptAEAD(encryptedPacket, effectiveKey);
      const duration = Math.round((performance.now() - start) * 100) / 100;
      setDecryptResult({
        status: 'SUCCESS',
        text: decrypted,
        durationMs: duration
      });
    } catch (err) {
      const duration = Math.round((performance.now() - start) * 100) / 100;
      setDecryptResult({
        status: 'ERROR',
        errorMsg: (err as Error).message,
        failClosed: true,
        durationMs: duration
      });
    }
  };

  // Tamper Simulators
  const handleTamperCiphertext = () => {
    if (!encryptedPacket || !originalPacket) return;
    const modified =
      encryptedPacket.ciphertextHex.slice(0, 4) === 'aaaa'
        ? 'bbbb' + encryptedPacket.ciphertextHex.slice(4)
        : 'aaaa' + encryptedPacket.ciphertextHex.slice(4);

    setEncryptedPacket({
      ...encryptedPacket,
      ciphertextHex: modified
    });
    setTamperState(prev => ({ ...prev, ciphertext: true }));
    setDecryptResult({ status: 'IDLE' });
  };

  const handleTamperTag = () => {
    if (!encryptedPacket || !originalPacket) return;
    const last = encryptedPacket.tagHex.slice(-1);
    const flipped = last === 'f' ? '0' : 'f';
    const modified = encryptedPacket.tagHex.slice(0, -1) + flipped;

    setEncryptedPacket({
      ...encryptedPacket,
      tagHex: modified
    });
    setTamperState(prev => ({ ...prev, tag: true }));
    setDecryptResult({ status: 'IDLE' });
  };

  const handleTamperAad = () => {
    if (!encryptedPacket || !originalPacket) return;
    let modifiedAad = encryptedPacket.aad;
    try {
      const parsed = JSON.parse(encryptedPacket.aad);
      parsed.robotId = parsed.robotId === 'AGV-04-HIJACKED' ? 'AGV-01' : 'AGV-04-HIJACKED';
      parsed.sector = 'UNAUTHORIZED-ZONE-X';
      modifiedAad = JSON.stringify(parsed, null, 2);
    } catch {
      modifiedAad = encryptedPacket.aad + '_TAMPERED';
    }

    setEncryptedPacket({
      ...encryptedPacket,
      aad: modifiedAad
    });
    setTamperState(prev => ({ ...prev, aad: true }));
    setDecryptResult({ status: 'IDLE' });
  };

  const handleResetToOriginal = () => {
    if (!originalPacket) return;
    setEncryptedPacket({ ...originalPacket });
    setTamperState({ ciphertext: false, tag: false, aad: false, wrongKey: false });
    setDecryptResult({ status: 'IDLE' });
  };

  // Run Test Suite
  const handleRunTestSuite = async () => {
    setIsRunningTests(true);
    try {
      const results = await runAeadTestSuite(activeKeyHex);
      setTestResults(results);
      setTestsExecuted(true);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                Tugas 2 Kriptografi & Keamanan Siber
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                Sub-CPMK: 3 (10% Nilai)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-950/80 text-purple-400 border border-purple-500/40">
                Git Tag: v0.2
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
              <span>Studio Enkripsi Terautentikasi (AEAD AES-256-GCM)</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Melindungi kerahasiaan (*confidentiality*) dan integritas (*authenticity*) data misi sensitif robot AGV
              menggunakan standar NIST SP 800-38D, kunci CSPRNG di luar repositori, Nonce 96-bit, AAD, dan Tag 128-bit
              dengan prinsip **Gagal Tertutup (Fail-Closed)**.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('tests')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Jalankan 5 Skenario Uji</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Panduan Demo 3 Menit</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 mt-6 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'lab'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lab Interaktif & Tamper</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tests'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Suite Pengujian (4+ Skenario)</span>
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'keys'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Kunci CSPRNG & Lokasi .env</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Panduan Demonstrasi 3 Menit</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LAB INTERAKTIF & TAMPER SIMULATOR                                  */}
      {/* ========================================================================= */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          {/* Key Quick Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-400 shrink-0 font-medium">Kunci Aktif (256-bit CSPRNG):</span>
              <code className="text-xs font-mono text-cyan-300 truncate bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {activeKeyHex || 'Memuat kunci CSPRNG...'}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700"
              >
                {keyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{keyCopied ? 'Tersalin' : 'Salin Kunci'}</span>
              </button>
              <button
                type="button"
                onClick={handleRegenerateKey}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 flex items-center gap-1 border border-cyan-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kunci Baru (CSPRNG)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sisi Kiri: Input Plaintext & AAD */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    1. Input Data Rahasia & AAD (Client/Robot)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  AES-256-GCM
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Payload Rahasia (Confidentiality / Plaintext):</span>
                  <span className="text-[10px] text-slate-500 font-normal">Akan dienkripsi, tersembunyi dari jaringan</span>
                </label>
                <textarea
                  rows={3}
                  value={plaintextInput}
                  onChange={e => setPlaintextInput(e.target.value)}
                  placeholder="Masukkan data sensitif..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Additional Authenticated Data (AAD):</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Plaintext publik, tapi terikat integritas</span>
                </label>
                <textarea
                  rows={4}
                  value={aadInput}
                  onChange={e => setAadInput(e.target.value)}
                  placeholder="Metadata JSON atau string..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  *AAD dikirim dalam bentuk terang agar router dapat membaca ID robot, namun tidak dapat diubah oleh penyerang.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleEncrypt}
                  disabled={isEncrypting}
                  className="w-full justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  <span>Enkripsi Terautentikasi (AEAD Encrypt)</span>
                </Button>
              </div>
            </div>

            {/* Sisi Kanan: Hasil Enkripsi Paket */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    2. Paket Kriptografi Hasil Enkripsi
                  </h3>
                </div>
                {encryptedPacket && (
                  <button
                    onClick={handleCopyPacket}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {packetCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{packetCopied ? 'Tersalin' : 'Salin JSON'}</span>
                  </button>
                )}
              </div>

              {!encryptedPacket ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg text-slate-500">
                  <Lock className="w-10 h-10 mb-2 text-slate-600" />
                  <p className="text-xs">Klik tombol &quot;Enkripsi Terautentikasi&quot; di sebelah kiri untuk menghasilkan paket.</p>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {/* IV / Nonce */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="text-amber-400 font-bold">1. Nonce / IV (96-bit / 12 Bytes):</span>
                      <span className="text-slate-500">CSPRNG Unik per paket</span>
                    </div>
                    <div className="text-amber-300 break-all select-all">{encryptedPacket.ivHex}</div>
                  </div>

                  {/* Ciphertext */}
                  <div className={`p-2.5 rounded-lg border ${tamperState.ciphertext ? 'bg-red-950/40 border-red-500/60' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="text-cyan-400 font-bold">2. Ciphertext:</span>
                      {tamperState.ciphertext && <span className="text-red-400 font-bold">⚠️ DIRUSAK (TAMPERED)</span>}
                    </div>
                    <div className="text-cyan-300 break-all max-h-20 overflow-y-auto select-all">
                      {encryptedPacket.ciphertextHex}
                    </div>
                  </div>

                  {/* Authentication Tag */}
                  <div className={`p-2.5 rounded-lg border ${tamperState.tag ? 'bg-red-950/40 border-red-500/60' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="text-emerald-400 font-bold">3. Authentication Tag (128-bit / 16 Bytes):</span>
                      {tamperState.tag && <span className="text-red-400 font-bold">⚠️ DIPALSUKAN</span>}
                    </div>
                    <div className="text-emerald-300 break-all select-all">{encryptedPacket.tagHex}</div>
                  </div>

                  {/* AAD */}
                  <div className={`p-2.5 rounded-lg border ${tamperState.aad ? 'bg-red-950/40 border-red-500/60' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="text-purple-400 font-bold">4. Associated Data (AAD):</span>
                      {tamperState.aad && <span className="text-red-400 font-bold">⚠️ METADATA DIUBAH</span>}
                    </div>
                    <div className="text-purple-300 break-all max-h-16 overflow-y-auto select-all">
                      {encryptedPacket.aad}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bagian Bawah: Simulator Dekripsi & Pengujian Manipulasi (Tamper Lab) */}
          {encryptedPacket && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>3. Simulasi Serangan Tamper & Pembuktian Gagal Tertutup (Fail-Closed)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Uji ketahanan sistem terhadap serangan manipulasi sebelum paket sampai ke stasiun penerima.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetToOriginal}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Pulihkan Paket Sah (Reset)
                </button>
              </div>

              {/* Action Buttons for Tampering */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={handleTamperCiphertext}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    tamperState.ciphertext
                      ? 'bg-red-950/60 border-red-500 text-red-300'
                      : 'bg-slate-950 hover:bg-red-950/30 border-slate-800 hover:border-red-500/50 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Rusak Ciphertext</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Ubah 1 bit/byte pada data sandi</p>
                </button>

                <button
                  type="button"
                  onClick={handleTamperTag}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    tamperState.tag
                      ? 'bg-red-950/60 border-red-500 text-red-300'
                      : 'bg-slate-950 hover:bg-red-950/30 border-slate-800 hover:border-red-500/50 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Palsukan Tag</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Ubah nilai 128-bit authentication tag</p>
                </button>

                <button
                  type="button"
                  onClick={handleTamperAad}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    tamperState.aad
                      ? 'bg-red-950/60 border-red-500 text-red-300'
                      : 'bg-slate-950 hover:bg-red-950/30 border-slate-800 hover:border-red-500/50 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tukar AAD Robot</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Replay attack: ubah robotId penerima</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecrypt(true)}
                  className="p-3 rounded-lg border bg-slate-950 hover:bg-amber-950/30 border-slate-800 hover:border-amber-500/50 text-slate-300 text-left transition-all"
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dekripsi Kunci Salah</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Gunakan kunci simetris 256-bit lain</p>
                </button>
              </div>

              {/* Main Decrypt Button */}
              <div className="pt-2">
                <Button
                  onClick={() => handleDecrypt(false)}
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  <span>Jalankan Dekripsi & Verifikasi Integritas (Receiver AGV)</span>
                </Button>
              </div>

              {/* Decrypt Result Output */}
              {decryptResult.status !== 'IDLE' && (
                <div className="mt-4">
                  {decryptResult.status === 'SUCCESS' ? (
                    <div className="bg-emerald-950/50 border border-emerald-500/60 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-300">
                            DEKRIPSI BERHASIL & INTEGRITAS TERVERIFIKASI
                          </span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400">
                          {decryptResult.durationMs} ms
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Authentication Tag 128-bit cocok 100% dengan ciphertext dan AAD. Plaintext dipulihkan:
                      </p>
                      <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 font-mono text-xs text-emerald-200">
                        {decryptResult.text}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-950/60 border border-red-500 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-red-400" />
                          <span className="text-sm font-bold text-red-300">
                            GAGAL TERTUTUP (FAIL-CLOSED): AUTENTIKASI INTEGRITAS DITOLAK!
                          </span>
                        </div>
                        <span className="text-xs font-mono text-red-400">
                          {decryptResult.durationMs} ms
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {decryptResult.errorMsg}
                      </p>
                      <div className="bg-black/40 p-2.5 rounded border border-red-500/30 text-xs text-red-200 font-mono">
                        Status Kriptografis: Web Crypto API menolak paket secara instan. Tidak ada plaintext yang didekripsi atau dibocorkan (Perlindungan Fail-Closed terpenuhi).
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUTOMATED TEST SUITE (RUBRIK K4 - MINIMAL 4 SKENARIO)             */}
      {/* ========================================================================= */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <span>Suite Pengujian Otomatis Kriptografi AEAD</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Memenuhi ketentuan Tugas 2: <strong className="text-white">&quot;Minimal 4 skenario uji, minimal 3 berhasil menolak kondisi tidak sah (data/tag dimodifikasi &amp; kunci salah ditolak)&quot;</strong>.
                  Diuji langsung secara atomik di runtime.
                </p>
              </div>

              <Button
                onClick={handleRunTestSuite}
                disabled={isRunningTests}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 px-4 shrink-0"
              >
                <Play className="w-4 h-4 mr-2" />
                <span>{isRunningTests ? 'Menguji...' : 'Eksekusi Seluruh Skenario'}</span>
              </Button>
            </div>
          </div>

          {/* Test Table / Cards */}
          {testsExecuted && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Total Skenario Uji</span>
                  <div className="text-2xl font-bold text-white font-mono mt-1">{testResults.length} Skenario</div>
                  <span className="text-[11px] text-cyan-400">Syarat minimum: 4 skenario</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Tingkat Kelulusan</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    {testResults.filter(r => r.passed).length} / {testResults.length} (100%)
                  </div>
                  <span className="text-[11px] text-emerald-400">Semua kondisi tidak sah ditolak</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Prinsip Desain</span>
                  <div className="text-2xl font-bold text-purple-400 font-mono mt-1">FAIL-CLOSED</div>
                  <span className="text-[11px] text-purple-300">Menolak tanpa kebocoran data</span>
                </div>
              </div>

              <div className="space-y-3">
                {testResults.map((tc, idx) => (
                  <div
                    key={tc.id}
                    className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                      tc.passed ? 'border-emerald-500/40' : 'border-red-500'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          tc.passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-red-950 text-red-400 border border-red-500/50'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{tc.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {tc.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{tc.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                          tc.passed
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-950/80 text-red-400 border border-red-500/40'
                        }`}>
                          {tc.passed ? '✔ PASS' : '✘ FAIL'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">{tc.executionTimeMs}ms</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Ekspektasi:</span>
                        <span className="font-mono text-slate-300">
                          {tc.expectedBehavior === 'DECRYPT_SUCCESS'
                            ? 'Plaintext kembali utuh (Sah)'
                            : 'Ditolak secara aman / Fail-Closed (Tidak Sah)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Hasil Aktual:</span>
                        <span className="font-mono text-cyan-300">{tc.actualStatus}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!testsExecuted && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
              <ShieldCheck className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Siap Menjalankan Pengujian Kriptografi</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Klik tombol di atas untuk menjalankan 5 skenario uji terautomasi langsung pada Web Crypto API di peramban Anda.
              </p>
              <Button
                onClick={handleRunTestSuite}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 px-5"
              >
                Mulai Uji Otomatis
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MANAJEMEN KUNCI CSPRNG & LOKASI PENYIMPANAN .ENV                   */}
      {/* ========================================================================= */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          {/* Rubrik K3 Highlights */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Kriteria Penilaian K3: Penanganan Masukan dan Kunci Simetris
                </h3>
                <p className="text-xs text-slate-400">
                  Kunci dibangkitkan dengan CSPRNG dan disimpan di luar repositori (tidak ada rahasia di Git).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  1. Pembangkitan Kunci CSPRNG
                </span>
                <p className="text-xs text-slate-400">
                  Menggunakan fungsi <code className="text-cyan-300">crypto.getRandomValues</code> (Web Crypto API) dan <code className="text-cyan-300">crypto.randomBytes(32)</code> pada Node.js, bukan fungsi pseudo-random biasa seperti <code className="text-red-400">Math.random()</code>. Menghasilkan entropi 256-bit penuh.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  2. Penyimpanan Kunci di Luar Repositori
                </span>
                <p className="text-xs text-slate-400">
                  Kunci disimpan pada berkas lingkungan lokal <code className="text-amber-300 font-mono">.env.local</code> yang terdaftar di <code className="text-amber-300 font-mono">.gitignore</code>. Berkas yang dibagikan ke Git hanyalah <code className="text-slate-300 font-mono">.env.example</code> tanpa rahasia asli.
                </p>
              </div>
            </div>
          </div>

          {/* Key Generator Tool */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Generator Kunci CSPRNG 256-Bit</span>
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <code className="text-xs font-mono text-emerald-300 break-all select-all">
                  {activeKeyHex}
                </code>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyKey}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700"
                  >
                    {keyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{keyCopied ? 'Tersalin' : 'Salin Hex'}</span>
                  </button>
                  <button
                    onClick={handleRegenerateKey}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Bangkitkan Kunci Baru</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>Perintah CLI mandiri untuk membangkitkan kunci identik via terminal Node.js:</p>
              <pre className="bg-slate-950 p-2.5 rounded border border-slate-800 text-cyan-300 font-mono overflow-x-auto">
                node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;hex&apos;))&quot;
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PANDUAN DEMONSTRASI 3 MENIT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Panduan & Skrip Demonstrasi Mandiri (Durasi: ±3 Menit)
                </h3>
                <p className="text-xs text-slate-400">
                  Ikuti panduan langkah per langkah ini saat presentasi demonstrasi di depan dosen pada pertemuan pekan 6.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Menit 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-cyan-400">
                    Menit 1: Pembukaan & Menunjukkan Penyimpanan Kunci di Luar Repo
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    00:00 - 01:00
                  </span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Sampaikan:</strong> &quot;Aplikasi kami mengintegrasikan enkripsi terautentikasi (AEAD) AES-256-GCM sesuai dokumen KEPUTUSAN.md untuk melindungi instruksi misi sensitif armada robot AGV.&quot;
                  </li>
                  <li>
                    <strong>Tunjukkan di VS Code / Terminal:</strong> Buka berkas <code className="text-amber-300">.gitignore</code> dan tunjukkan baris <code className="text-amber-300">.env.local</code>.
                  </li>
                  <li>
                    <strong>Tunjukkan:</strong> Berkas <code className="text-amber-300">.env.example</code> hanya berisi template kosong, sedangkan nilai kunci CSPRNG nyata tersimpan aman di <code className="text-amber-300">.env.local</code> di luar Git.
                  </li>
                </ul>
              </div>

              {/* Menit 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-emerald-400">
                    Menit 2: Parameter Kriptografi & Operasi Enkripsi AEAD
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    01:00 - 02:00
                  </span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Buka halaman web ini:</strong> Masuk ke tab <em>Lab Interaktif & Tamper</em>.
                  </li>
                  <li>
                    <strong>Jelaskan Parameter:</strong> Tunjukkan 4 parameter utama: Kunci 256-bit CSPRNG, IV 96-bit unik via CSPRNG, AAD (metadata domain robot), dan Tag Otentikasi 128-bit.
                  </li>
                  <li>
                    <strong>Klik Tombol Enkripsi:</strong> Tunjukkan bagaimana teks plaintext terenkripsi menjadi ciphertext heksadesimal dengan tag pengaman 128-bit.
                  </li>
                </ul>
              </div>

              {/* Menit 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-purple-400">
                    Menit 3: Pembuktian Fail-Closed & Suite Pengujian
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    02:00 - 03:00
                  </span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Simulasi Serangan:</strong> Klik tombol <em>Rusak Ciphertext</em> atau <em>Palsukan Tag</em>, lalu klik <em>Jalankan Dekripsi</em>.
                  </li>
                  <li>
                    <strong>Tunjukkan Respons Fail-Closed:</strong> Tunjukkan bahwa sistem secara tegas menolak paket yang dirusak dan tidak membocorkan sedikit pun data plaintext.
                  </li>
                  <li>
                    <strong>Uji Otomatis:</strong> Pindah ke tab <em>Suite Pengujian</em>, klik <em>Eksekusi Seluruh Skenario</em>, atau jalankan <code className="text-cyan-300 font-mono">npm test</code> di terminal untuk menunjukkan seluruh 5 skenario lulus 100%.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
