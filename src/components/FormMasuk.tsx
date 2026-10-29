"use client";

import { useActionState } from "react";
import { masuk } from "@/app/masuk/actions";
import type { StatusForm } from "@/lib/status-form";

const awal: StatusForm = {};
const kolom =
  "mt-1 block w-full rounded border px-3 py-2 bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500";

export default function FormMasuk() {
  const [status, aksi, pending] = useActionState(masuk, awal);
  const g = status.galat;

  return (
    <form action={aksi} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          className={kolom}
          aria-invalid={!!g?.email}
          aria-describedby="galat-email"
        />
        <p id="galat-email" className="text-sm text-red-400 mt-1">
          {g?.email?.[0]}
        </p>
      </div>

      <div>
        <label htmlFor="kataSandi" className="block font-medium">
          Kata sandi
        </label>
        <input
          id="kataSandi"
          name="kataSandi"
          type="password"
          autoComplete="current-password"
          className={kolom}
          aria-invalid={!!g?.kataSandi}
          aria-describedby="galat-sandi"
        />
        <p id="galat-sandi" className="text-sm text-red-400 mt-1">
          {g?.kataSandi?.[0]}
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-medium transition disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
      <p role="status" aria-live="polite" className="text-sm font-medium mt-2 text-amber-300">
        {status.pesan}
      </p>
    </form>
  );
}
