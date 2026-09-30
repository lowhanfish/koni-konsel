"use client";

import { Archive, Eye, Mail, MailOpen, Reply, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useDeleteMessage, useMessagesList, useUpdateMessage, type ContactMessage, type MessageStatus } from "@/hooks/use-messages";

const labels: Record<MessageStatus, string> = { NEW: "Baru", READ: "Dibaca", ARCHIVED: "Diarsipkan" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function MessagesPanel({ query, canDelete, showToast }: { query: string; canDelete: boolean; showToast: (message: string) => void }) {
  const [status, setStatus] = useState<MessageStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ContactMessage | null>(null);
  const messages = useMessagesList({ q: query, status: status === "ALL" ? undefined : status, page });
  const update = useUpdateMessage();
  const remove = useDeleteMessage();
  const rows = messages.data?.data ?? [];
  const meta = messages.data?.meta;

  async function openMessage(message: ContactMessage) {
    setSelected(message);
    if (message.status === "NEW") {
      try {
        const result = await update.mutateAsync({ id: message.id, status: "READ" });
        setSelected(result.data);
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Gagal menandai pesan");
      }
    }
  }

  async function setMessageStatus(message: ContactMessage, nextStatus: MessageStatus) {
    try {
      await update.mutateAsync({ id: message.id, status: nextStatus });
      setSelected((current) => current?.id === message.id ? { ...current, status: nextStatus } : current);
      showToast(`Pesan ditandai ${labels[nextStatus].toLowerCase()}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal memperbarui pesan");
    }
  }

  async function deleteMessage() {
    if (!deleteCandidate) return;
    try {
      await remove.mutateAsync(deleteCandidate.id);
      setDeleteCandidate(null);
      setSelected(null);
      showToast("Pesan berhasil dihapus");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menghapus pesan");
    }
  }

  return <>
    <div className="section-stat-grid">
      {[[meta?.statusCounts.NEW ?? 0, "Belum dibaca"], [meta?.statusCounts.READ ?? 0, "Sudah dibaca"], [meta?.today ?? 0, "Masuk hari ini"], [meta?.statusCounts.ARCHIVED ?? 0, "Diarsipkan"]].map(([value, label], index) => <article key={label}><span className={`section-stat-icon ssi-${index}`}><Mail /></span><div><strong>{value}</strong><small>{label}</small></div></article>)}
    </div>
    <section className="admin-panel section-table-panel">
      <div className="panel-head"><div><h2>Daftar Pesan Masuk</h2><p>{meta?.total ?? 0} pesan ditemukan</p></div><div className="section-filters"><select value={status} onChange={(event) => { setStatus(event.target.value as MessageStatus | "ALL"); setPage(1); }}><option value="ALL">Semua Status</option><option value="NEW">Baru</option><option value="READ">Dibaca</option><option value="ARCHIVED">Diarsipkan</option></select></div></div>
      <div className="admin-table-wrap"><table><thead><tr><th>PENGIRIM</th><th>SUBJEK</th><th>EMAIL</th><th>DITERIMA</th><th>STATUS</th><th /></tr></thead><tbody>
        {messages.isPending && <tr><td colSpan={6}>Memuat pesan…</td></tr>}
        {messages.isError && <tr><td colSpan={6}>Gagal memuat pesan.</td></tr>}
        {!messages.isPending && !messages.isError && rows.length === 0 && <tr><td colSpan={6}>Belum ada pesan yang cocok.</td></tr>}
        {rows.map((message, index) => <tr key={message.id}><td><div className="section-primary-cell"><span className={`row-avatar avatar-${index % 5}`}><Mail /></span><strong>{message.name}</strong></div></td><td>{message.subject}</td><td><a href={`mailto:${message.email}`}>{message.email}</a></td><td>{formatDate(message.createdAt)}</td><td><span className={message.status === "NEW" ? "status-draft" : "status-live"}><i />{labels[message.status]}</span></td><td><div className="row-actions"><button aria-label={`Buka pesan dari ${message.name}`} onClick={() => openMessage(message)}><Eye /></button><button aria-label={`Arsipkan pesan dari ${message.name}`} onClick={() => setMessageStatus(message, message.status === "ARCHIVED" ? "READ" : "ARCHIVED")}><Archive /></button>{canDelete && <button aria-label={`Hapus pesan dari ${message.name}`} onClick={() => setDeleteCandidate(message)}><Trash2 /></button>}</div></td></tr>)}
      </tbody></table></div>
      <div className="table-footer"><span>Menampilkan {rows.length} dari {meta?.total ?? 0} pesan</span><div><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>‹</button><button className="active">{page}</button><button onClick={() => setPage(page + 1)} disabled={page >= (meta?.pageCount ?? 1)}>›</button></div></div>
    </section>
    {selected && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><section className="admin-modal detail-modal"><div className="modal-head"><div><span><MailOpen /></span><div><h2>{selected.subject}</h2><p>{selected.name} · {selected.email}</p></div></div><button type="button" onClick={() => setSelected(null)}><X /></button></div><div className="detail-grid"><div><small>Status</small><strong>{labels[selected.status]}</strong></div><div><small>Diterima</small><span>{formatDate(selected.createdAt)}</span></div><div className="detail-wide"><small>Pesan</small><p>{selected.message}</p></div></div><div className="modal-actions"><button type="button" onClick={() => setMessageStatus(selected, selected.status === "ARCHIVED" ? "READ" : "ARCHIVED")}><Archive /> {selected.status === "ARCHIVED" ? "Kembalikan" : "Arsipkan"}</button><a className="admin-primary" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}><Reply /> Balas via Email</a></div></section></div>}
    {deleteCandidate && <div className="admin-modal-backdrop"><section className="admin-modal confirm-modal"><span><Trash2 /></span><h2>Hapus pesan?</h2><p>Pesan dari “{deleteCandidate.name}” akan dihapus permanen.</p><div className="modal-actions"><button type="button" onClick={() => setDeleteCandidate(null)}>Batal</button><button className="danger-button" type="button" onClick={deleteMessage} disabled={remove.isPending}>{remove.isPending ? "Menghapus…" : "Hapus Permanen"}</button></div></section></div>}
  </>;
}
