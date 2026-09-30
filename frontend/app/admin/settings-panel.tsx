"use client";

import { Camera, MessageCircle, Save, Settings, Video } from "lucide-react";
import { FormEvent } from "react";
import { fallbackSettings, useSettings, useUpdateSettings } from "@/hooks/use-settings";

export function SettingsPanel({ allowed, showToast }: { allowed: boolean; showToast: (message: string) => void }) {
  const settings = useSettings();
  const update = useUpdateSettings();
  const values = settings.data?.data ?? fallbackSettings;

  if (!allowed) return <section className="admin-panel access-panel"><Settings /><h2>Akses khusus Super Admin</h2><p>Pengaturan identitas dan kanal resmi website hanya dapat diubah oleh Super Admin.</p></section>;
  if (settings.isPending) return <section className="admin-panel access-panel"><Settings /><h2>Memuat pengaturan…</h2></section>;
  if (settings.isError) return <section className="admin-panel access-panel"><Settings /><h2>Pengaturan gagal dimuat</h2><p>Periksa koneksi database lalu muat ulang halaman.</p></section>;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await update.mutateAsync({ organizationName: String(form.get("organizationName") || ""), description: String(form.get("description") || ""), email: String(form.get("email") || ""), phone: String(form.get("phone") || ""), address: String(form.get("address") || ""), facebookUrl: String(form.get("facebookUrl") || "") || null, instagramUrl: String(form.get("instagramUrl") || "") || null, youtubeUrl: String(form.get("youtubeUrl") || "") || null });
      showToast("Pengaturan website berhasil disimpan");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menyimpan pengaturan");
    }
  }

  return <form key={values.id ?? "defaults"} className="settings-layout settings-single" onSubmit={save}><section className="admin-panel settings-form"><div className="panel-head"><div><h2>Identitas Website</h2><p>Informasi ini langsung digunakan pada halaman publik.</p></div></div><div className="settings-body"><label>Nama organisasi<input name="organizationName" required minLength={3} maxLength={191} defaultValue={values.organizationName} /></label><label>Deskripsi singkat<textarea name="description" required minLength={10} maxLength={2000} rows={4} defaultValue={values.description} /></label><div className="modal-row"><label>Email resmi<input name="email" type="email" required maxLength={191} defaultValue={values.email} /></label><label>Nomor telepon<input name="phone" required minLength={6} maxLength={40} defaultValue={values.phone} /></label></div><label>Alamat<textarea name="address" required minLength={10} maxLength={1000} rows={3} defaultValue={values.address} /></label></div></section><section className="admin-panel settings-form"><div className="panel-head"><div><h2>Media Sosial</h2><p>Kosongkan kanal yang belum memiliki URL resmi.</p></div></div><div className="settings-body"><label><MessageCircle /> Facebook<input name="facebookUrl" type="url" placeholder="https://facebook.com/..." defaultValue={values.facebookUrl ?? ""} /></label><label><Camera /> Instagram<input name="instagramUrl" type="url" placeholder="https://instagram.com/..." defaultValue={values.instagramUrl ?? ""} /></label><label><Video /> YouTube<input name="youtubeUrl" type="url" placeholder="https://youtube.com/..." defaultValue={values.youtubeUrl ?? ""} /></label><button className="admin-primary" type="submit" disabled={update.isPending}><Save /> {update.isPending ? "Menyimpan…" : "Simpan Pengaturan"}</button></div></section></form>;
}
