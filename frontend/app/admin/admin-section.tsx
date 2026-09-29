"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Bell, CalendarDays, Check, ChevronDown, CircleHelp, Download,
  Dumbbell, GalleryHorizontal, LayoutDashboard, Mail, Menu, Newspaper, Plus,
  Search, Settings, ShieldCheck, Trash2, Trophy, Users, X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useContentList, useCreateContent, useDeleteContent } from "@/hooks/use-content";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { contentStatuses, sectionKindMap, statusLabels, type ContentStatus } from "@/lib/content";
import { useAdminContentStore } from "@/stores/admin-content-store";
import { LogoutButton } from "./logout-button";

const menus = [
  ["Dashboard", LayoutDashboard, "/admin"], ["Berita", Newspaper, "/admin/berita"],
  ["Program", CalendarDays, "/admin/program"], ["Cabang Olahraga", Dumbbell, "/admin/cabang-olahraga"],
  ["Galeri", GalleryHorizontal, "/admin/galeri"], ["Prestasi", Trophy, "/admin/prestasi"],
  ["Pesan Masuk", Mail, "/admin/pesan-masuk"], ["Pengguna", Users, "/admin/pengguna"],
  ["Pengaturan", Settings, "/admin/pengaturan"],
] as const;

type SectionKey = "berita" | "program" | "cabang-olahraga" | "galeri" | "prestasi" | "pesan-masuk" | "pengguna" | "pengaturan";

const configs: Record<SectionKey, {
  title: string; description: string; button: string; icon: typeof Newspaper; stats: string[][]; rows: string[][];
}> = {
  berita: { title: "Berita", description: "Kelola artikel, pengumuman, dan informasi yang tampil di website.", button: "Tambah Berita", icon: Newspaper, stats: [["0", "Total berita"], ["—", "Telah terbit"], ["—", "Draf"], ["—", "Total pembaca"]], rows: [] },
  program: { title: "Program", description: "Atur program pembinaan, jadwal, sasaran, dan periode pelaksanaan.", button: "Tambah Program", icon: CalendarDays, stats: [["0", "Total program"], ["—", "Program aktif"], ["—", "Terjadwal"], ["—", "Diarsipkan"]], rows: [] },
  "cabang-olahraga": { title: "Cabang Olahraga", description: "Kelola data pengurus, atlet, pelatih, dan status cabang olahraga.", button: "Tambah Cabor", icon: Dumbbell, stats: [["0", "Total cabang"], ["—", "Cabor aktif"], ["—", "Draf"], ["—", "Diarsipkan"]], rows: [] },
  galeri: { title: "Galeri", description: "Kelola album, foto, dan video dokumentasi kegiatan KONI.", button: "Tambah Album", icon: GalleryHorizontal, stats: [["0", "Total album"], ["—", "Tayang"], ["—", "Draf"], ["—", "Diarsipkan"]], rows: [] },
  prestasi: { title: "Prestasi", description: "Catat medali, kejuaraan, atlet berprestasi, dan pencapaian kontingen.", button: "Tambah Prestasi", icon: Trophy, stats: [["0", "Total prestasi"], ["—", "Terbit"], ["—", "Draf"], ["—", "Diarsipkan"]], rows: [] },
  "pesan-masuk": { title: "Pesan Masuk", description: "Tinjau pertanyaan, permohonan informasi, dan pesan dari pengunjung.", button: "Tandai Dibaca", icon: Mail, stats: [["12", "Total pesan"], ["5", "Belum dibaca"], ["4", "Hari ini"], ["94%", "Tingkat respons"]], rows: [["Andi Saputra", "Informasi pendaftaran atletik", "Informasi", "10 menit lalu", "Baru"], ["SMA Negeri 1 Andoolo", "Permohonan kerja sama pembinaan", "Kerja Sama", "1 jam lalu", "Baru"]] },
  pengguna: { title: "Pengguna", description: "Kelola akun, peran, dan hak akses tim pengelola website.", button: "Tambah Pengguna", icon: Users, stats: [["8", "Total pengguna"], ["3", "Administrator"], ["4", "Editor"], ["1", "Kontributor"]], rows: [["Admin KONI", "admin@konikonsel.id", "Super Admin", "Sekarang", "Aktif"], ["Humas KONI", "humas@konikonsel.id", "Editor", "5 hari lalu", "Aktif"]] },
  pengaturan: { title: "Pengaturan", description: "Atur identitas website, kontak, media sosial, dan preferensi publikasi.", button: "Simpan Perubahan", icon: Settings, stats: [["8", "Menu publik"], ["2", "Logo aktif"], ["4", "Kanal sosial"], ["100%", "Profil lengkap"]], rows: [] },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export function AdminSection({ section }: { section: SectionKey }) {
  const config = configs[section];
  const kind = sectionKindMap[section];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const { query, status, page, setQuery, setStatus, setPage, reset } = useAdminContentStore();
  const debouncedQuery = useDebouncedValue(query, 350);
  const content = useContentList({ kind, q: debouncedQuery, status: status === "ALL" ? undefined : status, page, pageSize: 8, enabled: Boolean(kind) });
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();

  useEffect(() => reset(), [reset, section]);

  const localRows = useMemo(
    () => config.rows.filter((row) => row.join(" ").toLowerCase().includes(debouncedQuery.toLowerCase())),
    [config.rows, debouncedQuery],
  );
  const contentRows = content.data?.data ?? [];
  const rows = kind ? contentRows : localRows;
  const total = kind ? content.data?.meta.total ?? 0 : localRows.length;
  const stats = config.stats.map((entry, index) => index === 0 && kind ? [String(total), entry[1]] : entry);
  const Icon = config.icon;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!kind) {
      setModal(false);
      showToast(`${config.title} belum terhubung ke modul backend khusus`);
      return;
    }
    const form = new FormData(event.currentTarget);
    try {
      await createContent.mutateAsync({
        kind,
        title: String(form.get("title")),
        category: String(form.get("category") || "Umum"),
        status: String(form.get("status") || "DRAFT") as ContentStatus,
        summary: String(form.get("summary") || ""),
      });
      event.currentTarget.reset();
      setModal(false);
      showToast(`${config.title} berhasil disimpan`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menyimpan konten");
    }
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Hapus “${title}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteContent.mutateAsync(id);
      showToast("Konten berhasil dihapus");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menghapus konten");
    }
  }

  return (
    <main className="admin-shell">
      <aside className={sidebarOpen ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-brand"><Image src="/assets/logo-koni.png" alt="KONI" width={46} height={46} /><div><strong>KONI</strong><span>ADMIN PANEL</span></div><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><X /></button></div>
        <div className="admin-org"><Image src="/assets/logo-konawe-selatan.png" alt="Kabupaten Konawe Selatan" width={34} height={40} /><div><small>ORGANISASI</small><strong>KONI Konawe Selatan</strong></div><ChevronDown /></div>
        <nav className="admin-nav"><small>MENU UTAMA</small>{menus.slice(0, 6).map(([label, MenuIcon, href]) => <Link className={href === `/admin/${section}` ? "active" : ""} key={href} href={href}><MenuIcon /><span>{label}</span></Link>)}<small>MANAJEMEN</small>{menus.slice(6).map(([label, MenuIcon, href]) => <Link className={href === `/admin/${section}` ? "active" : ""} key={href} href={href}><MenuIcon /><span>{label}</span>{label === "Pesan Masuk" && <b>5</b>}</Link>)}</nav>
        <div className="admin-help"><CircleHelp /><strong>Butuh bantuan?</strong><span>Lihat panduan pengelolaan website.</span><button>Pusat Bantuan</button></div>
        <Link className="admin-back" href="/"><ArrowLeft /> Kembali ke Website</Link>
        <LogoutButton />
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><button className="admin-menu-button" onClick={() => setSidebarOpen(true)}><Menu /></button><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Cari ${config.title.toLowerCase()}...`} /></label><div className="admin-top-actions"><button><Bell /><i>3</i></button><span /><div className="admin-user"><div><strong>Admin KONI</strong><small>Super Administrator</small></div><b>AK</b><ChevronDown /></div></div></header>
        <div className="admin-content">
          <div className="admin-welcome"><div><span>MANAJEMEN KONTEN</span><h1>{config.title}</h1><p>{config.description}</p></div><div><button className="admin-outline"><Download /> Ekspor Data</button><button className="admin-primary" onClick={() => section === "pengaturan" ? showToast("Pengaturan berhasil disimpan") : setModal(true)}><Plus /> {config.button}</button></div></div>
          <div className="section-stat-grid">{stats.map(([value, label], index) => <article key={label}><span className={`section-stat-icon ssi-${index}`}><Icon /></span><div><strong>{value}</strong><small>{label}</small></div></article>)}</div>

          {section === "pengaturan" ? <SettingsPage onSave={() => showToast("Pengaturan berhasil disimpan")} /> : (
            <section className="admin-panel section-table-panel">
              <div className="panel-head"><div><h2>Daftar {config.title}</h2><p>{total} data ditemukan{query !== debouncedQuery ? " · mencari…" : ""}</p></div><div className="section-filters"><select value={status} onChange={(event) => setStatus(event.target.value as ContentStatus | "ALL")} disabled={!kind}><option value="ALL">Semua Status</option>{contentStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></div></div>
              <div className="admin-table-wrap"><table><thead><tr><th>JUDUL / NAMA</th><th>KATEGORI</th><th>DIPERBARUI</th><th>STATUS</th><th>DILIHAT</th><th /></tr></thead><tbody>
                {kind && content.isPending && <tr><td colSpan={6}>Memuat data…</td></tr>}
                {kind && content.isError && <tr><td colSpan={6}>Gagal memuat data. Pastikan MySQL berjalan.</td></tr>}
                {kind && !content.isPending && rows.length === 0 && <tr><td colSpan={6}>Belum ada data yang cocok.</td></tr>}
                {kind ? contentRows.map((item, index) => <tr key={item.id}><td><div className="section-primary-cell"><span className={`row-avatar avatar-${index % 5}`}><Icon /></span><strong>{item.title}</strong></div></td><td>{item.category || "—"}</td><td>{formatDate(item.updatedAt)}</td><td><span className={item.status === "DRAFT" || item.status === "SCHEDULED" ? "status-draft" : "status-live"}><i />{statusLabels[item.status]}</span></td><td>{item.viewCount.toLocaleString("id-ID")}</td><td><button aria-label={`Hapus ${item.title}`} onClick={() => remove(item.id, item.title)} disabled={deleteContent.isPending}><Trash2 /></button></td></tr>) : localRows.map((row, index) => <tr key={row[0]}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cellIndex === 0 ? <div className="section-primary-cell"><span className={`row-avatar avatar-${index}`}><Icon /></span><strong>{cell}</strong></div> : cell}</td>)}<td>—</td></tr>)}
              </tbody></table></div>
              <div className="table-footer"><span>Menampilkan {rows.length} dari {total} data</span>{kind && <div><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>‹</button><button className="active">{page}</button><button onClick={() => setPage(page + 1)} disabled={page >= (content.data?.meta.pageCount ?? 1)}>›</button></div>}</div>
            </section>
          )}
        </div>
      </section>

      {modal && <div className="admin-modal-backdrop"><form className="admin-modal section-modal" onSubmit={save}><div className="modal-head"><div><span><Icon /></span><div><h2>{config.button}</h2><p>Data akan disimpan ke database MySQL.</p></div></div><button type="button" onClick={() => setModal(false)}><X /></button></div><label>Nama atau judul<input name="title" required minLength={3} placeholder={`Masukkan ${config.title.toLowerCase()}`} /></label><div className="modal-row"><label>Kategori<input name="category" placeholder="Umum" /></label><label>Status<select name="status" defaultValue="DRAFT">{contentStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label></div><label>Deskripsi<textarea name="summary" rows={5} placeholder="Tambahkan deskripsi atau catatan..." /></label><div className="modal-actions"><button type="button" onClick={() => setModal(false)}>Batal</button><button className="admin-primary" type="submit" disabled={createContent.isPending}>{createContent.isPending ? "Menyimpan…" : "Simpan Data"}</button></div></form></div>}
      {toast && <div className="admin-toast"><Check /><span>{toast}</span></div>}
    </main>
  );
}

function SettingsPage({ onSave }: { onSave: () => void }) {
  return <form className="settings-layout" onSubmit={(event) => { event.preventDefault(); onSave(); }}><aside><button className="active" type="button">Identitas Website</button><button type="button">Informasi Kontak</button><button type="button">Media Sosial</button><button type="button">SEO & Metadata</button><button type="button">Preferensi Publikasi</button></aside><section className="admin-panel settings-form"><div className="panel-head"><div><h2>Identitas Website</h2><p>Informasi utama yang tampil pada website publik.</p></div></div><div className="settings-body"><label>Nama organisasi<input defaultValue="KONI Kabupaten Konawe Selatan" /></label><label>Deskripsi singkat<textarea rows={4} defaultValue="Portal resmi Komite Olahraga Nasional Indonesia Kabupaten Konawe Selatan." /></label><div className="modal-row"><label>Email resmi<input type="email" defaultValue="konikonsel@gmail.com" /></label><label>Nomor telepon<input defaultValue="0821 1000 9090" /></label></div><label>Alamat<textarea rows={3} defaultValue="Jl. Poros Andoolo, Kecamatan Andoolo, Kabupaten Konawe Selatan, Sulawesi Tenggara" /></label><div className="settings-toggle"><div><strong>Mode publikasi otomatis</strong><span>Konten langsung tayang setelah disimpan oleh administrator.</span></div><input type="checkbox" defaultChecked /></div><button className="admin-primary" type="submit"><ShieldCheck /> Simpan Pengaturan</button></div></section></form>;
}
