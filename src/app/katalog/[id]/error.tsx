"use client";

import { useEffect } from "react";

export default function GalatItem({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-xl p-4 my-8 rounded-lg border border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
      <h2 className="text-xl font-bold">Item gagal diproses</h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
        Kode rujukan: <code className="font-mono bg-red-100 dark:bg-red-900/60 px-1 py-0.5 rounded">{error.digest ?? "tidak ada"}</code>
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded border border-red-300 dark:border-red-700 bg-white dark:bg-zinc-800 px-3 py-1 text-sm font-medium hover:bg-red-100 dark:hover:bg-zinc-700 transition"
      >
        Coba lagi
      </button>
    </div>
  );
}

