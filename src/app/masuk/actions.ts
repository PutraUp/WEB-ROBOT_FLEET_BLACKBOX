"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { skemaMasuk } from "@/lib/skema";
import { buatSesi, hapusSesi } from "@/lib/sesi";
import type { StatusForm } from "@/lib/status-form";

export async function masuk(
  _sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  const hasil = skemaMasuk.safeParse(Object.fromEntries(formData));
  if (!hasil.success) {
    return { galat: z.flattenError(hasil.error).fieldErrors };
  }
  const { email, kataSandi } = hasil.data;
  // akun demo sementara; autentikasi sebenarnya pada Modul 10-11
  if (
    email !== process.env.DEMO_EMAIL ||
    kataSandi !== process.env.DEMO_KATA_SANDI
  ) {
    return { pesan: "Email atau kata sandi salah." };
  }
  await buatSesi(email);
  redirect("/katalog/tambah");
}

export async function keluar() {
  await hapusSesi();
  redirect("/");
}

