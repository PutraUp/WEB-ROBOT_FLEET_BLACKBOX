"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { skemaItem } from "@/lib/skema";
import { judulSudahAda, tambahItem } from "@/lib/data";
import { bacaSesi } from "@/lib/sesi";
import { prisma } from "@/lib/prisma";
import type { StatusForm } from "@/lib/status-form";

export async function simpanItem(
  _sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  // 1. Sesi: Verifikasi hak akses pengguna
  if (!(await bacaSesi())) {
    return { pesan: "Silakan masuk terlebih dahulu." };
  }

  const mentah = Object.fromEntries(formData);
  const nilai = {
    judul: String(mentah.judul ?? ""),
    kategori: String(mentah.kategori ?? ""),
    deskripsi: String(mentah.deskripsi ?? ""),
  };

  // 2. Validasi Bentuk Data (Zod 4 safeParse)
  const hasil = skemaItem.safeParse(mentah);
  if (!hasil.success) {
    return {
      galat: z.flattenError(hasil.error).fieldErrors,
      pesan: "Periksa kembali isian formulir.",
      nilai,
    };
  }

  // 3. Validasi Semantik: Judul belum pernah digunakan (cek memori & PostgreSQL)
  let duplikat = judulSudahAda(hasil.data.judul);
  if (!duplikat) {
    try {
      const itemDiDb = await prisma.item.findFirst({
        where: { judul: { equals: hasil.data.judul, mode: "insensitive" } },
      });
      if (itemDiDb) duplikat = true;
    } catch {
      // Menoleransi jika PostgreSQL belum terhubung
    }
  }

  if (duplikat) {
    return {
      galat: { judul: ["Judul sudah dipakai item lain"] },
      nilai,
    };
  }

  let id: number;
  try {
    // 4. Mutasi Data: Simpan langsung ke database PostgreSQL via Prisma
    try {
      const itemDb = await prisma.item.create({
        data: {
          judul: hasil.data.judul,
          kategori: hasil.data.kategori,
          deskripsi: hasil.data.deskripsi,
          tersedia: hasil.data.tersedia,
        },
      });
      id = itemDb.id;
      // Sinkronkan ke data memori lokal
      tambahItem(hasil.data);
    } catch {
      // Fallback mulus ke penyimpanan memori jika server PostgreSQL belum menyala
      id = tambahItem(hasil.data).id;
    }
  } catch (e) {
    console.error("simpanItem gagal:", e);
    return { pesan: "Item gagal disimpan. Coba lagi.", nilai };
  }

  // 5. Revalidasi cache & Pengalihan rute (di luar blok try-catch)
  revalidatePath("/katalog");
  redirect(`/katalog/${id}`);
}
