import type { Metadata } from "next";
import FormMasuk from "@/components/FormMasuk";

export const metadata: Metadata = { title: "Masuk | Robot Fleet Black Box" };

export default function HalamanMasuk() {
  return (
    <main id="konten" className="mx-auto max-w-md p-6 bg-slate-900/90 border border-slate-800 rounded-xl my-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">Masuk</h1>
      <p className="text-xs text-slate-400 mt-1">
        Masuk menggunakan akun demo untuk mengelola katalog item
      </p>
      <FormMasuk />
    </main>
  );
}

