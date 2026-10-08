"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, CalendarDays, Camera, Check, CircleHelp, Download,
  AlertTriangle, Bell, Dumbbell, ExternalLink, Eye, GalleryHorizontal, LayoutDashboard, Mail, Menu,
  Newspaper, Paperclip, Pencil, Play, Plus, Search, Settings, Trash2, Trophy, Upload, Users, Video, X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { deleteMedia, uploadMedia, useContentItem, useContentList, useCreateContent, useDeleteContent, useUpdateContent } from "@/hooks/use-content";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMessagesList } from "@/hooks/use-messages";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  contentStatuses,
  extractYouTubeId,
  getGalleryMedia,
  getContentAttachment,
  getContentImage,
  getContentSource,
  sectionKindMap,
  statusLabels,
  type ContentItem,
  type ContentStatus,
} from "@/lib/content";
import { contentFormSchema } from "@/lib/validation/content";
import { useAdminContentStore } from "@/stores/admin-content-store";
import { LogoutButton } from "./logout-button";
import { MessagesPanel } from "./messages-panel";
import { UsersPanel } from "./users-panel";
import { SettingsPanel } from "./settings-panel";
import { RichTextEditor } from "./rich-text-editor";
import { RichTextContent } from "../components/rich-text-content";

const menus = [
  ["Dashboard", LayoutDashboard, "/admin"], ["Berita", Newspaper, "/admin/berita"],
  ["Pengumuman", Bell, "/admin/pengumuman"],
  ["Program", CalendarDays, "/admin/program"], ["Cabang Olahraga", Dumbbell, "/admin/cabang-olahraga"],
  ["Galeri", GalleryHorizontal, "/admin/galeri"], ["Prestasi", Trophy, "/admin/prestasi"],
  ["Pesan Masuk", Mail, "/admin/pesan-masuk"], ["Pengguna", Users, "/admin/pengguna"],
  ["Pengaturan", Settings, "/admin/pengaturan"],
] as const;

type SectionKey = "berita" | "pengumuman" | "program" | "cabang-olahraga" | "galeri" | "prestasi" | "pesan-masuk" | "pengguna" | "pengaturan";

const configs: Record<SectionKey, {
  title: string; description: string; button: string; icon: typeof Newspaper; stats: string[][]; rows: string[][];
}> = {
  berita: { title: "Berita", description: "Kelola artikel, pengumuman, dan informasi yang tampil di website.", button: "Tambah Berita", icon: Newspaper, stats: [["0", "Total berita"], ["—", "Terbit/aktif"], ["—", "Draf"], ["—", "Terjadwal/arsip"]], rows: [] },
  pengumuman: { title: "Pengumuman", description: "Kelola pemberitahuan resmi, agenda, dan informasi penting KONI.", button: "Tambah Pengumuman", icon: Bell, stats: [["0", "Total pengumuman"], ["—", "Terbit/aktif"], ["—", "Draf"], ["—", "Terjadwal/arsip"]], rows: [] },
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
  const [galleryMediaType, setGalleryMediaType] = useState<"PHOTO" | "VIDEO">("PHOTO");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [previewId, setPreviewId] = useState<string>();
  const [deleteCandidate, setDeleteCandidate] = useState<ContentItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [selectedAttachmentName, setSelectedAttachmentName] = useState("");
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
  const editingSource = getContentSource(editing?.metadata);
  const editingImage = getContentImage(editing?.metadata);
  const editingAttachment = getContentAttachment(editing?.metadata);
  const editingGallery = getGalleryMedia(editing?.metadata);
  const previewSource = getContentSource(preview.data?.data.metadata);
  const previewImage = getContentImage(preview.data?.data.metadata);
  const previewAttachment = getContentAttachment(preview.data?.data.metadata);
  const previewGallery = getGalleryMedia(preview.data?.data.metadata);

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
    const isNews = section === "berita";
    const isAnnouncement = section === "pengumuman";
    const isGallery = section === "galeri";
    const hasPublishDate = isNews || section === "pengumuman";
    const publishedDate = String(form.get("publishedAt") || "");
    const imageFile = form.get("imageFile");
    const attachmentFile = form.get("attachmentFile");
    const selectedImage = imageFile instanceof File && imageFile.size > 0 ? imageFile : null;
    const selectedAttachment = attachmentFile instanceof File && attachmentFile.size > 0 ? attachmentFile : null;
    const removeAttachment = form.get("removeAttachment") === "on";

    if (isNews && !selectedImage && !editingImage) {
      setFormErrors({ imageFile: "Gambar berita wajib diunggah" });
      return;
    }

    const mediaType = isGallery ? (galleryMediaType === "VIDEO" ? "VIDEO" : "PHOTO") : undefined;
    const videoUrl = isGallery && mediaType === "VIDEO" ? String(form.get("videoUrl") || "").trim() : "";
    const youtubeId = isGallery && mediaType === "VIDEO" ? extractYouTubeId(videoUrl) : null;

    if (isGallery && mediaType === "VIDEO" && !youtubeId) {
      setFormErrors({ videoUrl: "Tautan YouTube tidak valid. Gunakan format seperti https://www.youtube.com/watch?v=... atau https://youtu.be/..." });
      return;
    }

    if (isGallery && mediaType === "PHOTO" && !selectedImage && !editingImage?.imageUrl) {
      setFormErrors({ imageFile: "Foto dokumentasi wajib diunggah" });
      return;
    }

    const newsMetadata = isNews ? {
      sourceTitle: String(form.get("sourceTitle") || ""),
      sourceUrl: String(form.get("sourceUrl") || ""),
      imageUrl: editingImage?.imageUrl ?? "/api/media/pending",
      imageAlt: String(form.get("imageAlt") || ""),
      imageCredit: String(form.get("imageCredit") || "") || undefined,
      ...(editingImage?.imageFileId ? { imageFileId: editingImage.imageFileId } : {}),
    } : undefined;

    const announcementMetadata = isAnnouncement && editingAttachment && !removeAttachment ? {
      attachmentUrl: editingAttachment.attachmentUrl,
      ...(editingAttachment.attachmentFileId ? { attachmentFileId: editingAttachment.attachmentFileId } : {}),
      attachmentName: editingAttachment.attachmentName,
      attachmentMimeType: editingAttachment.attachmentMimeType,
      ...(editingAttachment.attachmentSize ? { attachmentSize: editingAttachment.attachmentSize } : {}),
    } : isAnnouncement && removeAttachment ? {} : undefined;

    let finalGalleryImageUrl = editingImage?.imageUrl ?? editingGallery?.imageUrl;
    if (isGallery && mediaType === "VIDEO" && !finalGalleryImageUrl && youtubeId) {
      finalGalleryImageUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    const galleryMetadata = isGallery ? {
      mediaType,
      videoUrl: mediaType === "VIDEO" ? videoUrl : undefined,
      youtubeId: mediaType === "VIDEO" ? youtubeId ?? undefined : undefined,
      imageUrl: finalGalleryImageUrl ?? (mediaType === "PHOTO" ? "/api/media/pending" : undefined),
      imageAlt: String(form.get("imageAlt") || form.get("title") || ""),
      ...(editingImage?.imageFileId ? { imageFileId: editingImage.imageFileId } : {}),
    } : undefined;

    const input = {
      title: String(form.get("title") || ""),
      category: String(form.get("category") || "") || null,
      status: String(form.get("status") || "DRAFT") as ContentStatus,
      summary: String(form.get("summary") || "") || null,
      ...(hasPublishDate ? { publishedAt: publishedDate ? new Date(`${publishedDate}T00:00:00+08:00`) : undefined } : {}),
      ...(newsMetadata ? { metadata: newsMetadata } : announcementMetadata ? { metadata: announcementMetadata } : galleryMetadata ? { metadata: galleryMetadata } : {}),
    };
    const initialParsed = contentFormSchema.safeParse(input);
    if (!initialParsed.success) {
      setFormErrors(Object.fromEntries(initialParsed.error.issues.map((issue) => [String(issue.path.at(-1) ?? "form"), issue.message])));
      return;
    }
    setFormErrors({});
    setSaving(true);
    let uploadedFileId: string | undefined;
    try {
      let finalInput = initialParsed.data;
      if (selectedImage && (newsMetadata || isGallery)) {
        const uploaded = await uploadMedia(selectedImage, "image");
        uploadedFileId = uploaded.id;
        if (isGallery && galleryMetadata) {
          finalInput = contentFormSchema.parse({
            ...input,
            metadata: {
              ...galleryMetadata,
              imageUrl: uploaded.url,
              imageFileId: uploaded.id,
            },
          });
        } else if (newsMetadata) {
          finalInput = contentFormSchema.parse({ ...input, metadata: { ...newsMetadata, imageUrl: uploaded.url, imageFileId: uploaded.id } });
        }
      } else if (selectedAttachment) {
        const uploaded = await uploadMedia(selectedAttachment, "attachment");
        uploadedFileId = uploaded.id;
        finalInput = contentFormSchema.parse({
          ...input,
          metadata: { attachmentUrl: uploaded.url, attachmentFileId: uploaded.id, attachmentName: uploaded.name, attachmentMimeType: uploaded.mimeType, attachmentSize: uploaded.size },
        });
      }
      if (editing) await updateContent.mutateAsync({ id: editing.id, input: finalInput });
      else await createContent.mutateAsync({ kind, ...finalInput });
      const replacedFileId = selectedImage ? editingImage?.imageFileId : selectedAttachment || removeAttachment ? editingAttachment?.attachmentFileId : null;
      if (replacedFileId) void deleteMedia(replacedFileId).catch(() => undefined);
      event.currentTarget.reset();
      setModal(false);
      setEditing(null);
      showToast(`${config.title} berhasil ${editing ? "diperbarui" : "disimpan"}`);
    } catch (error) {
      if (uploadedFileId) await deleteMedia(uploadedFileId).catch(() => undefined);
      showToast(error instanceof Error ? error.message : "Gagal menyimpan konten");
    } finally {
      setSaving(false);
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
    setGalleryMediaType("PHOTO");
    setVideoUrlInput("");
    setFormErrors({});
    setSaving(false);
    setSelectedImageName("");
    setSelectedAttachmentName("");
    setModal(true);
  }

  function openEdit(item: ContentItem) {
    setEditing(item);
    const gMedia = getGalleryMedia(item.metadata);
    setGalleryMediaType(gMedia?.mediaType ?? "PHOTO");
    setVideoUrlInput(gMedia?.videoUrl ?? "");
    setFormErrors({});
    setSaving(false);
    setSelectedImageName("");
    setSelectedAttachmentName("");
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
        <nav className="admin-nav"><small>MENU UTAMA</small>{menus.slice(0, 7).map(([label, MenuIcon, href]) => <Link className={href === `/admin/${section}` ? "active" : ""} key={href} href={href}><MenuIcon /><span>{label}</span></Link>)}<small>MANAJEMEN</small>{menus.slice(7).map(([label, MenuIcon, href]) => <Link className={href === `/admin/${section}` ? "active" : ""} key={href} href={href}><MenuIcon /><span>{label}</span>{label === "Pesan Masuk" && Boolean(messageSummary.data?.meta.statusCounts.NEW) && <b>{messageSummary.data?.meta.statusCounts.NEW}</b>}</Link>)}</nav>
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
              <div className="admin-table-wrap"><table><thead><tr><th>JUDUL / NAMA</th><th>KATEGORI</th><th>{section === "berita" || section === "pengumuman" ? "TANGGAL TERBIT" : "DIPERBARUI"}</th><th>STATUS</th><th>DILIHAT</th><th /></tr></thead><tbody>
                {kind && content.isPending && <tr><td colSpan={6}>Memuat data…</td></tr>}
                {kind && content.isError && <tr><td colSpan={6}>Gagal memuat data. Pastikan MySQL berjalan.</td></tr>}
                {kind && !content.isPending && rows.length === 0 && <tr><td colSpan={6}>Belum ada data yang cocok.</td></tr>}
                {kind ? contentRows.map((item, index) => {
                  const itemImage = getContentImage(item.metadata);
                  const itemGallery = getGalleryMedia(item.metadata);
                  const displayThumb = itemGallery?.imageUrl || itemImage?.imageUrl;
                  const isVideo = itemGallery?.mediaType === "VIDEO";
                  return <tr key={item.id}><td><div className="section-primary-cell">{displayThumb ? <span className="row-avatar news-row-image" style={{ backgroundImage: `url("${displayThumb}")`, position: "relative" }} role="img" aria-label={itemGallery?.imageAlt || itemImage?.imageAlt}>{isVideo && <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.4)", color: "#fff", borderRadius: "inherit" }}><Play size={12} fill="currentColor" /></span>}</span> : <span className={`row-avatar avatar-${index % 5}`}><Icon /></span>}<strong>{item.title}</strong></div></td><td>{item.category || "—"}</td><td>{formatDate(section === "berita" || section === "pengumuman" ? item.publishedAt ?? item.updatedAt : item.updatedAt)}</td><td><span className={item.status === "DRAFT" || item.status === "SCHEDULED" ? "status-draft" : "status-live"}><i />{statusLabels[item.status]}</span></td><td>{item.viewCount.toLocaleString("id-ID")}</td><td><div className="row-actions"><button aria-label={`Lihat ${item.title}`} onClick={() => setPreviewId(item.id)}><Eye /></button>{canEdit && <button aria-label={`Edit ${item.title}`} onClick={() => openEdit(item)}><Pencil /></button>}{canDelete && <button aria-label={`Hapus ${item.title}`} onClick={() => setDeleteCandidate(item)}><Trash2 /></button>}</div></td></tr>;
                }) : localRows.map((row, index) => <tr key={row[0]}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cellIndex === 0 ? <div className="section-primary-cell"><span className={`row-avatar avatar-${index}`}><Icon /></span><strong>{cell}</strong></div> : cell}</td>)}<td>—</td></tr>)}
              </tbody></table></div>
              <div className="table-footer"><span>Menampilkan {rows.length} dari {total} data</span>{kind && <div><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>‹</button><button className="active" aria-current="page" disabled>{page}</button><button onClick={() => setPage(page + 1)} disabled={page >= (content.data?.meta.pageCount ?? 1)}>›</button></div>}</div>
            </section>
          )}
        </div>
      </section>

      {modal && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(false)}><form key={editing?.id ?? "create"} className="admin-modal section-modal" onSubmit={save} noValidate>
        <div className="modal-head"><div><span><Icon /></span><div><h2>{editing ? `Edit ${config.title}` : config.button}</h2><p>Data akan disimpan ke database MySQL.</p></div></div><button type="button" onClick={() => setModal(false)}><X /></button></div>
        <label>Nama atau judul<input name="title" defaultValue={editing?.title} aria-invalid={Boolean(formErrors.title)} placeholder={`Masukkan ${config.title.toLowerCase()}`} />{formErrors.title && <small className="field-error">{formErrors.title}</small>}</label>
        <div className="modal-row"><label>Kategori<input name="category" defaultValue={editing?.category ?? ""} aria-invalid={Boolean(formErrors.category)} placeholder="Umum" />{formErrors.category && <small className="field-error">{formErrors.category}</small>}</label><label>Status<select name="status" defaultValue={editing?.status ?? "DRAFT"}>{contentStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select>{formErrors.status && <small className="field-error">{formErrors.status}</small>}</label></div>
        {section === "pengumuman" && <div className="announcement-upload-fields">
          <label>Tanggal terbit<input name="publishedAt" type="date" defaultValue={editing?.publishedAt?.slice(0, 10)} /></label>
          <label className="upload-box"><Upload /><strong>{selectedAttachmentName || (editingAttachment ? "Ganti lampiran" : "Unggah lampiran")}</strong><span>PDF, JPG, PNG, WebP, atau GIF · maksimal 10 MB</span><input name="attachmentFile" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" aria-describedby="attachment-help" onChange={(event) => setSelectedAttachmentName(event.target.files?.[0]?.name ?? "")} /></label>
          {editingAttachment && <div className="current-upload"><Paperclip /><div><small>Lampiran saat ini</small><a href={editingAttachment.attachmentUrl} target="_blank" rel="noreferrer">{editingAttachment.attachmentName}</a></div><label><input type="checkbox" name="removeAttachment" /> Hapus</label></div>}
          {formErrors.attachmentFile && <small id="attachment-help" className="field-error">{formErrors.attachmentFile}</small>}
        </div>}
        {section === "berita" && <div className="news-source-fields">
          <div className="modal-row"><label>Tanggal terbit<input name="publishedAt" type="date" defaultValue={editing?.publishedAt?.slice(0, 10)} /></label><label>Kredit foto<input name="imageCredit" defaultValue={editingImage?.imageCredit ?? ""} placeholder="Foto: Nama sumber" /></label></div>
          <label className="upload-box"><Upload /><strong>{selectedImageName || (editingImage ? "Ganti gambar berita" : "Unggah gambar berita")}</strong><span>JPG, PNG, WebP, atau GIF · maksimal 5 MB</span><input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-invalid={Boolean(formErrors.imageFile)} onChange={(event) => setSelectedImageName(event.target.files?.[0]?.name ?? "")} /></label>
          {editingImage && <div className="current-upload image-current"><span style={{ backgroundImage: `url("${editingImage.imageUrl}")` }} role="img" aria-label={editingImage.imageAlt} /><div><small>Gambar saat ini</small><strong>{editingImage.imageAlt}</strong></div></div>}
          {formErrors.imageFile && <small className="field-error">{formErrors.imageFile}</small>}
          <label>Teks alternatif gambar<input name="imageAlt" defaultValue={editingImage?.imageAlt ?? ""} aria-invalid={Boolean(formErrors.imageAlt)} placeholder="Jelaskan isi gambar secara singkat" />{formErrors.imageAlt && <small className="field-error">{formErrors.imageAlt}</small>}</label>
          <label>Nama sumber<input name="sourceTitle" defaultValue={editingSource?.sourceTitle ?? ""} aria-invalid={Boolean(formErrors.sourceTitle)} placeholder="Nama media — Judul artikel" />{formErrors.sourceTitle && <small className="field-error">{formErrors.sourceTitle}</small>}</label>
          <label>URL sumber<input name="sourceUrl" type="url" defaultValue={editingSource?.sourceUrl ?? ""} aria-invalid={Boolean(formErrors.sourceUrl)} placeholder="https://…" />{formErrors.sourceUrl && <small className="field-error">{formErrors.sourceUrl}</small>}</label>
        </div>}
        {section === "galeri" && <div className="gallery-admin-fields">
          <div className="gallery-type-toggle">
            <button
              type="button"
              className={`gallery-type-btn ${galleryMediaType === "PHOTO" ? "active" : ""}`}
              onClick={() => setGalleryMediaType("PHOTO")}
            >
              <Camera size={15} /> Foto Dokumentasi
            </button>
            <button
              type="button"
              className={`gallery-type-btn ${galleryMediaType === "VIDEO" ? "active" : ""}`}
              onClick={() => setGalleryMediaType("VIDEO")}
            >
              <Play size={14} fill="currentColor" /> Video (YouTube)
            </button>
          </div>
          <input type="hidden" name="galleryMediaType" value={galleryMediaType} />

          {galleryMediaType === "VIDEO" ? (
            <div>
              <div className="gallery-admin-hint">
                <strong>Hemat Bandwidth & Cepat:</strong> Masukkan URL video YouTube (misal: https://www.youtube.com/watch?v=... atau https://youtu.be/...). Video diputar lewat pemutar resmi YouTube tanpa membebani penyimpanan server. Thumbnail otomatis diambil dari YouTube.
              </div>
              <label>
                URL / Tautan Video YouTube
                <input
                  name="videoUrl"
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  aria-invalid={Boolean(formErrors.videoUrl)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {formErrors.videoUrl && <small className="field-error">{formErrors.videoUrl}</small>}
              </label>
              {extractYouTubeId(videoUrlInput) && (
                <div className="gallery-admin-video-preview">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(videoUrlInput)}`}
                    title="Pratinjau Video YouTube"
                    allowFullScreen
                  />
                </div>
              )}
              <label className="upload-box" style={{ marginTop: "12px" }}>
                <Upload />
                <strong>{selectedImageName || (editingImage ? "Ganti cover khusus video (opsional)" : "Unggah cover khusus video (opsional)")}</strong>
                <span>Kosongkan jika ingin memakai thumbnail bawaan YouTube</span>
                <input
                  name="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => setSelectedImageName(event.target.files?.[0]?.name ?? "")}
                />
              </label>
              {editingImage && (
                <div className="current-upload image-current">
                  <span style={{ backgroundImage: `url("${editingImage.imageUrl}")` }} role="img" aria-label={editingImage.imageAlt} />
                  <div>
                    <small>Cover saat ini</small>
                    <strong>{editingImage.imageAlt}</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="upload-box">
                <Upload />
                <strong>{selectedImageName || (editingImage ? "Ganti foto dokumentasi" : "Unggah foto dokumentasi")}</strong>
                <span>JPG, PNG, WebP, atau GIF · maksimal 5 MB</span>
                <input
                  name="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  aria-invalid={Boolean(formErrors.imageFile)}
                  onChange={(event) => setSelectedImageName(event.target.files?.[0]?.name ?? "")}
                />
              </label>
              {editingImage && (
                <div className="current-upload image-current">
                  <span style={{ backgroundImage: `url("${editingImage.imageUrl}")` }} role="img" aria-label={editingImage.imageAlt} />
                  <div>
                    <small>Foto saat ini</small>
                    <strong>{editingImage.imageAlt}</strong>
                  </div>
                </div>
              )}
              {formErrors.imageFile && <small className="field-error">{formErrors.imageFile}</small>}
              <label>
                Keterangan atau teks alternatif foto
                <input
                  name="imageAlt"
                  defaultValue={editingImage?.imageAlt ?? ""}
                  placeholder="Deskripsi singkat isi foto"
                />
              </label>
            </div>
          )}
        </div>}
        <label>Deskripsi atau detail<RichTextEditor name="summary" defaultValue={editing?.summary} error={formErrors.summary} /></label>
        <div className="modal-actions"><button type="button" onClick={() => setModal(false)}>Batal</button><button className="admin-primary" type="submit" disabled={saving || createContent.isPending || updateContent.isPending}>{saving || createContent.isPending || updateContent.isPending ? "Mengunggah & menyimpan…" : editing ? "Simpan Perubahan" : "Simpan Data"}</button></div>
      </form></div>}
      {previewId && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setPreviewId(undefined)}><section className="admin-modal detail-modal"><div className="modal-head"><div><span><Eye /></span><div><h2>Detail {config.title}</h2><p>Pratinjau data tersimpan.</p></div></div><button type="button" onClick={() => setPreviewId(undefined)}><X /></button></div>{preview.isPending ? <p>Memuat detail…</p> : preview.isError ? <p>Detail gagal dimuat.</p> : preview.data && <div className="detail-grid">
        {previewGallery?.mediaType === "VIDEO" && previewGallery.youtubeId ? (
          <div className="detail-wide gallery-admin-video-preview">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${previewGallery.youtubeId}`}
              title={preview.data.data.title}
              allowFullScreen
            />
          </div>
        ) : previewGallery?.imageUrl || previewImage ? (
          <figure className="detail-wide admin-news-image">
            <div style={{ backgroundImage: `url("${previewGallery?.imageUrl || previewImage?.imageUrl}")` }} role="img" aria-label={previewGallery?.imageAlt || previewImage?.imageAlt}/>
            {previewImage?.imageCredit && <figcaption>{previewImage.imageCredit}</figcaption>}
          </figure>
        ) : null}
        <div><small>Judul</small><strong>{preview.data.data.title}</strong></div><div><small>Kategori</small><span>{preview.data.data.category || "—"}</span></div><div><small>Status</small><span>{statusLabels[preview.data.data.status]}</span></div><div><small>Slug</small><code>{preview.data.data.slug}</code></div>
        {preview.data.data.publishedAt && <div><small>Tanggal terbit</small><span>{formatDate(preview.data.data.publishedAt)}</span></div>}
        {previewGallery?.videoUrl && (
          <div className="detail-wide">
            <small>Video YouTube</small>
            <a href={previewGallery.videoUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Buka di YouTube <ExternalLink size={12} />
            </a>
          </div>
        )}
        {previewSource && <div className="detail-wide"><small>Sumber</small><a href={previewSource.sourceUrl} target="_blank" rel="noreferrer">{previewSource.sourceTitle}</a></div>}
        {previewAttachment && <div className="detail-wide preview-attachment"><small>Lampiran</small><a href={`${previewAttachment.attachmentUrl}?download=1`}><Paperclip />{previewAttachment.attachmentName} <Download /></a></div>}
        <div className="detail-wide"><small>Deskripsi</small><RichTextContent content={preview.data.data.summary} /></div><div><small>Dibuat</small><span>{formatDate(preview.data.data.createdAt)}</span></div><div><small>Diperbarui</small><span>{formatDate(preview.data.data.updatedAt)}</span></div>
      </div>}</section></div>}
      {deleteCandidate && <div className="admin-modal-backdrop"><section className="admin-modal confirm-modal"><span><AlertTriangle /></span><h2>Hapus konten?</h2><p>“{deleteCandidate.title}” akan dihapus permanen dan tidak dapat dipulihkan.</p><div className="modal-actions"><button type="button" onClick={() => setDeleteCandidate(null)}>Batal</button><button className="danger-button" type="button" onClick={remove} disabled={deleteContent.isPending}>{deleteContent.isPending ? "Menghapus…" : "Hapus Permanen"}</button></div></section></div>}
      {toast && <div className="admin-toast"><Check /><span>{toast}</span></div>}
    </main>
  );
}
