"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, CalendarDays, Check, CircleHelp, Download,
  AlertTriangle, Dumbbell, Eye, GalleryHorizontal, LayoutDashboard, Mail, Menu,
  Newspaper, Pencil, Plus, Search, Settings, Trash2, Trophy, Users, X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useContentItem, useContentList, useCreateContent, useDeleteContent, useUpdateContent } from "@/hooks/use-content";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMessagesList } from "@/hooks/use-messages";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { contentStatuses, sectionKindMap, statusLabels, type ContentItem, type ContentStatus } from "@/lib/content";
import { contentFormSchema } from "@/lib/validation/content";
import { useAdminContentStore } from "@/stores/admin-content-store";
import { LogoutButton } from "./logout-button";
import { MessagesPanel } from "./messages-panel";
import { UsersPanel } from "./users-panel";
import { SettingsPanel } from "./settings-panel";

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
  berita: { title: "Berita", description: "Kelola artikel, pengumuman, dan informasi yang tampil di website.", button: "Tambah Berita", icon: Newspaper, stats: [["0", "Total berita"], ["—", "Terbit/aktif"], ["—", "Draf"], ["—", "Terjadwal/arsip"]], rows: [] },
  program: { title: "Program", description: "Atur program pembinaan, jadwal, sasaran, dan periode pelaksanaan.", button: "Tambah Program", icon: CalendarDays, stats: [["0", "Total program"], ["—", "Terbit/aktif"], ["—", "Draf"], ["—", "Terjadwal/arsip"]], rows: [] },
  "cabang-olahraga": { title: "Cabang Olahraga", description: "Kelola data pengurus, atlet, pelatih, dan status cabang olahraga.", button: "Tambah Cabor", icon: Dumbbell, stats: [["0", "Total cabang"], ["—", "Terbit/aktif"], ["—", "Draf"], ["—", "Terjadwal/arsip"]], rows: [] },
  galeri: { title: "Galeri", description: "Kelola album, foto, dan video dokumentasi kegiatan KONI.", button: "Tambah Album", icon: GalleryHorizontal, stats: [["0", "Total album"], ["—", "Terbit/aktif"], ["—", "Draf"], ["—", "Terjadwal/arsip"]], rows: [] },
  prestasi: { title: "Prestasi", description: "Catat medali, kejuaraan, atlet berprestasi, dan pencapaian kontingen.", button: "Tambah Prestasi", icon: Trophy, stats: [["0", "Total prestasi"], ["—", "Terbit/aktif"], ["—", "Draf"], ["—", "Terjadwal/arsip"]], rows: [] },
  "pesan-masuk": { title: "Pesan Masuk", description: "Tinjau pertanyaan, permohonan informasi, dan pesan dari pengunjung.", button: "", icon: Mail, stats: [], rows: [] },
  pengguna: { title: "Pengguna", description: "Kelola akun, peran, dan hak akses tim pengelola website.", button: "", icon: Users, stats: [], rows: [] },
  pengaturan: { title: "Pengaturan", description: "Atur identitas website, kontak, dan kanal media sosial resmi.", button: "", icon: Settings, stats: [], rows: [] },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export function AdminSection({ section }: { section: SectionKey }) {
  const config = configs[section];
  const kind = sectionKindMap[section];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [previewId, setPreviewId] = useState<string>();
  const [deleteCandidate, setDeleteCandidate] = useState<ContentItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const { query, status, page, setQuery, setStatus, setPage, reset } = useAdminContentStore();
  const debouncedQuery = useDebouncedValue(query, 350);
  const content = useContentList({ kind, q: debouncedQuery, status: status === "ALL" ? undefined : status, page, pageSize: 8, enabled: Boolean(kind) });
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const preview = useContentItem(previewId);
  const currentUser = useCurrentUser();
  const messageSummary = useMessagesList({ page: 1 });

  useEffect(() => reset(), [reset, section]);

  const localRows = useMemo(
    () => config.rows.filter((row) => row.join(" ").toLowerCase().includes(debouncedQuery.toLowerCase())),
    [config.rows, debouncedQuery],
  );
  const contentRows = content.data?.data ?? [];
  const rows = kind ? contentRows : localRows;
  const total = kind ? content.data?.meta.total ?? 0 : localRows.length;
  const Icon = config.icon;
  const role = currentUser.data?.data.role;
  const canEdit = role === "SUPER_ADMIN" || role === "EDITOR";
  const canDelete = role === "SUPER_ADMIN";

  const statusCounts = content.data?.meta.statusCounts ?? {};
  const overallTotal = Object.values(statusCounts).reduce((sum, value) => sum + (value ?? 0), 0);
  const stats = kind ? [
    [String(overallTotal), config.stats[0][1]],
    [String((statusCounts.PUBLISHED ?? 0) + (statusCounts.ACTIVE ?? 0)), config.stats[1][1]],
    [String(statusCounts.DRAFT ?? 0), config.stats[2][1]],
    [String((statusCounts.SCHEDULED ?? 0) + (statusCounts.ARCHIVED ?? 0)), config.stats[3][1]],
  ] : config.stats;

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
    const input = {
      title: String(form.get("title") || ""),
      category: String(form.get("category") || "") || null,
      status: String(form.get("status") || "DRAFT") as ContentStatus,
      summary: String(form.get("summary") || "") || null,
    };
    const parsed = contentFormSchema.safeParse(input);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setFormErrors(Object.fromEntries(Object.entries(fields).map(([name, messages]) => [name, messages?.[0] ?? "Data tidak valid"])));
      return;
    }
    setFormErrors({});
    try {
      if (editing) await updateContent.mutateAsync({ id: editing.id, input: parsed.data });
      else await createContent.mutateAsync({ kind, ...parsed.data });
      event.currentTarget.reset();
      setModal(false);
      setEditing(null);
      showToast(`${config.title} berhasil ${editing ? "diperbarui" : "disimpan"}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menyimpan konten");
    }
  }

  async function remove() {
    if (!deleteCandidate) return;
    try {
      await deleteContent.mutateAsync(deleteCandidate.id);
      setDeleteCandidate(null);
      showToast("Konten berhasil dihapus");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menghapus konten");
    }
  }

  function openCreate() {
    setEditing(null);
    setFormErrors({});
    setModal(true);
  }

  function openEdit(item: ContentItem) {
    setEditing(item);
    setFormErrors({});
    setModal(true);
  }

  async function exportData() {
    if (!kind) return;
    try {
      const exported: ContentItem[] = [];
      let exportPage = 1;
      let pageCount = 1;
      do {
        const params = new URLSearchParams({ kind, page: String(exportPage), pageSize: "100" });
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (status !== "ALL") params.set("status", status);
        const response = await fetch(`/api/content?${params}`);
        const body = await response.json() as { data?: ContentItem[]; meta?: { pageCount: number }; error?: string };
        if (!response.ok || !body.data || !body.meta) throw new Error(body.error || "Gagal mengekspor data");
        exported.push(...body.data);
        pageCount = body.meta.pageCount;
        exportPage += 1;
      } while (exportPage <= pageCount);
      const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
      const rows = [["Judul", "Slug", "Kategori", "Status", "Diperbarui", "Dilihat"], ...exported.map((item) => [item.title, item.slug, item.category, statusLabels[item.status], item.updatedAt, item.viewCount])];
      const blob = new Blob([rows.map((row) => row.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${section}-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      showToast(`${exported.length} data berhasil diekspor`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal mengekspor data");
    }
  }

  return (
    <main className="admin-shell">
      <aside className={sidebarOpen ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-brand"><Image src="/assets/logo-koni.png" alt="KONI" width={46} height={46} /><div><strong>KONI</strong><span>ADMIN PANEL</span></div><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><X /></button></div>
        <div className="admin-org"><Image src="/assets/logo-konawe-selatan.png" alt="Kabupaten Konawe Selatan" width={34} height={40} /><div><small>ORGANISASI</small><strong>KONI Konawe Selatan</strong></div></div>
        <nav className="admin-nav"><small>MENU UTAMA</small>{menus.slice(0, 6).map(([label, MenuIcon, href]) => <Link className={href === `/admin/${section}` ? "active" : ""} key={href} href={href}><MenuIcon /><span>{label}</span></Link>)}<small>MANAJEMEN</small>{menus.slice(6).map(([label, MenuIcon, href]) => <Link className={href === `/admin/${section}` ? "active" : ""} key={href} href={href}><MenuIcon /><span>{label}</span>{label === "Pesan Masuk" && Boolean(messageSummary.data?.meta.statusCounts.NEW) && <b>{messageSummary.data?.meta.statusCounts.NEW}</b>}</Link>)}</nav>
        <div className="admin-help"><CircleHelp /><strong>Panel pengelolaan</strong><span>Gunakan menu di atas untuk mengelola data website.</span></div>
        <Link className="admin-back" href="/"><ArrowLeft /> Kembali ke Website</Link>
        <LogoutButton />
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><button className="admin-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><Menu /></button>{section === "pengaturan" ? <strong className="admin-topbar-context">Pengaturan website</strong> : <label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Cari ${config.title.toLowerCase()}...`} /></label>}<div className="admin-top-actions"><div className="admin-user"><div><strong>{currentUser.data?.data.name ?? "Admin KONI"}</strong><small>{role?.replaceAll("_", " ") ?? "Memuat akun…"}</small></div><b>{(currentUser.data?.data.name ?? "AK").split(" ").map((word) => word[0]).join("").slice(0, 2)}</b></div></div></header>
        <div className="admin-content">
          <div className="admin-welcome"><div><span>MANAJEMEN KONTEN</span><h1>{config.title}</h1><p>{config.description}</p></div><div>{kind && <button className="admin-outline" onClick={exportData}><Download /> Ekspor Data</button>}{!(["pesan-masuk", "pengguna", "pengaturan"] as SectionKey[]).includes(section) && <button className="admin-primary" onClick={openCreate}><Plus /> {config.button}</button>}</div></div>
          {!(["pesan-masuk", "pengguna", "pengaturan"] as SectionKey[]).includes(section) && <div className="section-stat-grid">{stats.map(([value, label], index) => <article key={label}><span className={`section-stat-icon ssi-${index}`}><Icon /></span><div><strong>{value}</strong><small>{label}</small></div></article>)}</div>}

          {section === "pesan-masuk" ? <MessagesPanel key={debouncedQuery} query={debouncedQuery} canDelete={canDelete} showToast={showToast} /> : section === "pengguna" ? <UsersPanel key={debouncedQuery} query={debouncedQuery} allowed={role === "SUPER_ADMIN"} currentUserId={currentUser.data?.data.id} showToast={showToast} /> : section === "pengaturan" ? <SettingsPanel allowed={role === "SUPER_ADMIN"} showToast={showToast} /> : (
            <section className="admin-panel section-table-panel">
              <div className="panel-head"><div><h2>Daftar {config.title}</h2><p>{total} data ditemukan{query !== debouncedQuery ? " · mencari…" : ""}</p></div><div className="section-filters"><select value={status} onChange={(event) => setStatus(event.target.value as ContentStatus | "ALL")} disabled={!kind}><option value="ALL">Semua Status</option>{contentStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></div></div>
              <div className="admin-table-wrap"><table><thead><tr><th>JUDUL / NAMA</th><th>KATEGORI</th><th>DIPERBARUI</th><th>STATUS</th><th>DILIHAT</th><th /></tr></thead><tbody>
                {kind && content.isPending && <tr><td colSpan={6}>Memuat data…</td></tr>}
                {kind && content.isError && <tr><td colSpan={6}>Gagal memuat data. Pastikan MySQL berjalan.</td></tr>}
                {kind && !content.isPending && rows.length === 0 && <tr><td colSpan={6}>Belum ada data yang cocok.</td></tr>}
                {kind ? contentRows.map((item, index) => <tr key={item.id}><td><div className="section-primary-cell"><span className={`row-avatar avatar-${index % 5}`}><Icon /></span><strong>{item.title}</strong></div></td><td>{item.category || "—"}</td><td>{formatDate(item.updatedAt)}</td><td><span className={item.status === "DRAFT" || item.status === "SCHEDULED" ? "status-draft" : "status-live"}><i />{statusLabels[item.status]}</span></td><td>{item.viewCount.toLocaleString("id-ID")}</td><td><div className="row-actions"><button aria-label={`Lihat ${item.title}`} onClick={() => setPreviewId(item.id)}><Eye /></button>{canEdit && <button aria-label={`Edit ${item.title}`} onClick={() => openEdit(item)}><Pencil /></button>}{canDelete && <button aria-label={`Hapus ${item.title}`} onClick={() => setDeleteCandidate(item)}><Trash2 /></button>}</div></td></tr>) : localRows.map((row, index) => <tr key={row[0]}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cellIndex === 0 ? <div className="section-primary-cell"><span className={`row-avatar avatar-${index}`}><Icon /></span><strong>{cell}</strong></div> : cell}</td>)}<td>—</td></tr>)}
              </tbody></table></div>
              <div className="table-footer"><span>Menampilkan {rows.length} dari {total} data</span>{kind && <div><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>‹</button><button className="active">{page}</button><button onClick={() => setPage(page + 1)} disabled={page >= (content.data?.meta.pageCount ?? 1)}>›</button></div>}</div>
            </section>
          )}
        </div>
      </section>

      {modal && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(false)}><form key={editing?.id ?? "create"} className="admin-modal section-modal" onSubmit={save} noValidate><div className="modal-head"><div><span><Icon /></span><div><h2>{editing ? `Edit ${config.title}` : config.button}</h2><p>Data akan disimpan ke database MySQL.</p></div></div><button type="button" onClick={() => setModal(false)}><X /></button></div><label>Nama atau judul<input name="title" defaultValue={editing?.title} aria-invalid={Boolean(formErrors.title)} placeholder={`Masukkan ${config.title.toLowerCase()}`} />{formErrors.title && <small className="field-error">{formErrors.title}</small>}</label><div className="modal-row"><label>Kategori<input name="category" defaultValue={editing?.category ?? ""} aria-invalid={Boolean(formErrors.category)} placeholder="Umum" />{formErrors.category && <small className="field-error">{formErrors.category}</small>}</label><label>Status<select name="status" defaultValue={editing?.status ?? "DRAFT"}>{contentStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select>{formErrors.status && <small className="field-error">{formErrors.status}</small>}</label></div><label>Deskripsi<textarea name="summary" defaultValue={editing?.summary ?? ""} aria-invalid={Boolean(formErrors.summary)} rows={5} placeholder="Tambahkan deskripsi atau catatan..." />{formErrors.summary && <small className="field-error">{formErrors.summary}</small>}</label><div className="modal-actions"><button type="button" onClick={() => setModal(false)}>Batal</button><button className="admin-primary" type="submit" disabled={createContent.isPending || updateContent.isPending}>{createContent.isPending || updateContent.isPending ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Simpan Data"}</button></div></form></div>}
      {previewId && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setPreviewId(undefined)}><section className="admin-modal detail-modal"><div className="modal-head"><div><span><Eye /></span><div><h2>Detail {config.title}</h2><p>Pratinjau data tersimpan.</p></div></div><button type="button" onClick={() => setPreviewId(undefined)}><X /></button></div>{preview.isPending ? <p>Memuat detail…</p> : preview.isError ? <p>Detail gagal dimuat.</p> : preview.data && <div className="detail-grid"><div><small>Judul</small><strong>{preview.data.data.title}</strong></div><div><small>Kategori</small><span>{preview.data.data.category || "—"}</span></div><div><small>Status</small><span>{statusLabels[preview.data.data.status]}</span></div><div><small>Slug</small><code>{preview.data.data.slug}</code></div><div className="detail-wide"><small>Deskripsi</small><p>{preview.data.data.summary || "Belum ada deskripsi."}</p></div><div><small>Dibuat</small><span>{formatDate(preview.data.data.createdAt)}</span></div><div><small>Diperbarui</small><span>{formatDate(preview.data.data.updatedAt)}</span></div></div>}</section></div>}
      {deleteCandidate && <div className="admin-modal-backdrop"><section className="admin-modal confirm-modal"><span><AlertTriangle /></span><h2>Hapus konten?</h2><p>“{deleteCandidate.title}” akan dihapus permanen dan tidak dapat dipulihkan.</p><div className="modal-actions"><button type="button" onClick={() => setDeleteCandidate(null)}>Batal</button><button className="danger-button" type="button" onClick={remove} disabled={deleteContent.isPending}>{deleteContent.isPending ? "Menghapus…" : "Hapus Permanen"}</button></div></section></div>}
      {toast && <div className="admin-toast"><Check /><span>{toast}</span></div>}
    </main>
  );
}
