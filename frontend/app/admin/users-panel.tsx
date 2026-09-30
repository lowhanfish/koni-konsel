"use client";

import { AlertTriangle, Pencil, Plus, Trash2, UserRound, Users, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsersList, type ManagedUser, type UserRole } from "@/hooks/use-users";

const roleLabels: Record<UserRole, string> = { SUPER_ADMIN: "Super Admin", EDITOR: "Editor", CONTRIBUTOR: "Kontributor" };

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Belum pernah";
}

export function UsersPanel({ query, allowed, currentUserId, showToast }: { query: string; allowed: boolean; currentUserId?: string; showToast: (message: string) => void }) {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ManagedUser | null>(null);
  const users = useUsersList({ q: query, page, enabled: allowed });
  const create = useCreateUser();
  const update = useUpdateUser();
  const remove = useDeleteUser();
  const rows = users.data?.data ?? [];
  const meta = users.data?.meta;

  if (!allowed) return <section className="admin-panel access-panel"><AlertTriangle /><h2>Akses khusus Super Admin</h2><p>Akun dengan peran Editor atau Kontributor tidak dapat melihat dan mengubah pengguna.</p></section>;

  function openCreate() { setEditing(null); setModal(true); }
  function openEdit(user: ManagedUser) { setEditing(user); setModal(true); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const input = { name: String(form.get("name") || ""), email: String(form.get("email") || ""), role: (form.get("role") || editing?.role || "CONTRIBUTOR") as UserRole, isActive: editing?.id === currentUserId ? true : form.get("isActive") === "on", ...(password ? { password } : {}) };
    if (!editing && !password) return showToast("Password minimal 8 karakter wajib diisi");
    try {
      if (editing) await update.mutateAsync({ id: editing.id, input });
      else await create.mutateAsync({ ...input, password });
      setModal(false);
      showToast(`Pengguna berhasil ${editing ? "diperbarui" : "dibuat"}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menyimpan pengguna");
    }
  }

  async function deleteUser() {
    if (!deleteCandidate) return;
    try {
      await remove.mutateAsync(deleteCandidate.id);
      setDeleteCandidate(null);
      showToast("Pengguna berhasil dihapus");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menghapus pengguna");
    }
  }

  return <>
    <div className="section-stat-grid">{[[meta?.total ?? 0, "Total pengguna"], [meta?.roleCounts.SUPER_ADMIN ?? 0, "Super Admin aktif"], [(meta?.roleCounts.EDITOR ?? 0) + (meta?.roleCounts.CONTRIBUTOR ?? 0), "Tim konten aktif"], [meta?.inactive ?? 0, "Nonaktif"]].map(([value, label], index) => <article key={label}><span className={`section-stat-icon ssi-${index}`}><Users /></span><div><strong>{value}</strong><small>{label}</small></div></article>)}</div>
    <section className="admin-panel section-table-panel"><div className="panel-head"><div><h2>Daftar Pengguna</h2><p>{meta?.total ?? 0} akun ditemukan</p></div><button className="admin-primary" onClick={openCreate}><Plus /> Tambah Pengguna</button></div><div className="admin-table-wrap"><table><thead><tr><th>NAMA</th><th>EMAIL</th><th>PERAN</th><th>LOGIN TERAKHIR</th><th>STATUS</th><th /></tr></thead><tbody>
      {users.isPending && <tr><td colSpan={6}>Memuat pengguna…</td></tr>}{users.isError && <tr><td colSpan={6}>Gagal memuat pengguna.</td></tr>}{!users.isPending && !users.isError && rows.length === 0 && <tr><td colSpan={6}>Belum ada pengguna yang cocok.</td></tr>}
      {rows.map((user, index) => <tr key={user.id}><td><div className="section-primary-cell"><span className={`row-avatar avatar-${index % 5}`}><UserRound /></span><strong>{user.name}{user.id === currentUserId ? " (Anda)" : ""}</strong></div></td><td>{user.email}</td><td>{roleLabels[user.role]}</td><td>{formatDate(user.lastLoginAt)}</td><td><span className={user.isActive ? "status-live" : "status-draft"}><i />{user.isActive ? "Aktif" : "Nonaktif"}</span></td><td><div className="row-actions"><button aria-label={`Edit ${user.name}`} onClick={() => openEdit(user)}><Pencil /></button>{user.id !== currentUserId && <button aria-label={`Hapus ${user.name}`} onClick={() => setDeleteCandidate(user)}><Trash2 /></button>}</div></td></tr>)}
    </tbody></table></div><div className="table-footer"><span>Menampilkan {rows.length} dari {meta?.total ?? 0} pengguna</span><div><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>‹</button><button className="active" aria-current="page" disabled>{page}</button><button onClick={() => setPage(page + 1)} disabled={page >= (meta?.pageCount ?? 1)}>›</button></div></div></section>
    {modal && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(false)}><form key={editing?.id ?? "new-user"} className="admin-modal section-modal" onSubmit={save}><div className="modal-head"><div><span><UserRound /></span><div><h2>{editing ? "Edit Pengguna" : "Tambah Pengguna"}</h2><p>Atur identitas dan hak akses panel admin.</p></div></div><button type="button" onClick={() => setModal(false)}><X /></button></div><label>Nama<input name="name" required minLength={2} maxLength={120} defaultValue={editing?.name} /></label><label>Email<input name="email" type="email" required maxLength={191} defaultValue={editing?.email} /></label><div className="modal-row"><label>Peran<select name="role" defaultValue={editing?.role ?? "CONTRIBUTOR"} disabled={editing?.id === currentUserId}><option value="SUPER_ADMIN">Super Admin</option><option value="EDITOR">Editor</option><option value="CONTRIBUTOR">Kontributor</option></select></label><label>Password {editing && <small>(kosongkan jika tetap)</small>}<input name="password" type="password" minLength={8} required={!editing} autoComplete="new-password" /></label></div><label className="settings-toggle"><span><strong>Akun aktif</strong><small>Pengguna dapat login dan menggunakan panel.</small></span><input name="isActive" type="checkbox" defaultChecked={editing?.isActive ?? true} disabled={editing?.id === currentUserId} /></label><div className="modal-actions"><button type="button" onClick={() => setModal(false)}>Batal</button><button className="admin-primary" type="submit" disabled={create.isPending || update.isPending}>{create.isPending || update.isPending ? "Menyimpan…" : "Simpan Pengguna"}</button></div></form></div>}
    {deleteCandidate && <div className="admin-modal-backdrop"><section className="admin-modal confirm-modal"><span><AlertTriangle /></span><h2>Hapus pengguna?</h2><p>Akun “{deleteCandidate.name}” dan seluruh sesinya akan dihapus.</p><div className="modal-actions"><button type="button" onClick={() => setDeleteCandidate(null)}>Batal</button><button className="danger-button" type="button" onClick={deleteUser} disabled={remove.isPending}>{remove.isPending ? "Menghapus…" : "Hapus Pengguna"}</button></div></section></div>}
  </>;
}
