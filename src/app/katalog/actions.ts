"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { skemaItem } from "@/lib/skema";
import { judulSudahAda, tambahItem } from "@/lib/data";
import { bacaSesi } from "@/lib/sesi";
import type { StatusForm } from "@/lib/status-form";

export async function simpanItem(
  _sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  // 1. sesi
  if (!(await bacaSesi())) {
    return { pesan: "Silakan masuk terlebih dahulu." };
  }

  const mentah = Object.fromEntries(formData);
  const nilai = {
    judul: String(mentah.judul ?? ""),
    kategori: String(mentah.kategori ?? ""),
    deskripsi: String(mentah.deskripsi ?? ""),
  };

  // 2. validasi bentuk
  const hasil = skemaItem.safeParse(mentah);
  if (!hasil.success) {
    return {
      galat: z.flattenError(hasil.error).fieldErrors,
      pesan: "Periksa kembali isian formulir.",
      nilai,
    };
  }

  // 3. validasi semantik
  if (judulSudahAda(hasil.data.judul)) {
    return {
      galat: { judul: ["Judul sudah dipakai item lain"] },
      nilai,
    };
  }

  let id: number;
  try {
    id = tambahItem(hasil.data).id; // 4. mutasi
  } catch (e) {
    console.error("simpanItem gagal:", e);
    return { pesan: "Item gagal disimpan. Coba lagi.", nilai };
  }

  revalidatePath("/katalog");
  redirect(`/katalog/${id}`); // 5. di luar try
}
