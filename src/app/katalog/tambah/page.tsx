import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FormItem from "@/components/FormItem";
import { bacaSesi } from "@/lib/sesi";
import { keluar } from "@/app/masuk/actions";

export const metadata: Metadata = { title: "Tambah Item | Robot Fleet Black Box" };

export default async function HalamanTambahItem() {
  const sesi = await bacaSesi();
  if (!sesi) redirect("/masuk");

  return (
    <main id="konten" className="mx-auto max-w-2xl p-6 bg-slate-900/90 border border-slate-800 rounded-xl my-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tambah Item</h1>
          <p className="mt-1 text-sm text-slate-400">
            Masuk sebagai <strong className="text-cyan-400">{sesi.email}</strong>
          </p>
        </div>
        <form action={keluar}>
          <button
            type="submit"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-rose-400 px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition"
          >
            Keluar
          </button>
        </form>
      </div>
      <FormItem />
    </main>
  );
}

