"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Bell, CalendarDays,
  CircleHelp, Dumbbell, Eye, GalleryHorizontal, LayoutDashboard,
  Mail, Medal, Menu, MoreHorizontal, Newspaper, Plus, Search, Settings,
  Trophy, Users, X,
} from "lucide-react";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useContentList } from "@/hooks/use-content";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMessagesList } from "@/hooks/use-messages";
import { getContentImage, statusLabels } from "@/lib/content";
import { LogoutButton } from "./logout-button";

const menus = [
  ["Dashboard", LayoutDashboard, "/admin"], ["Berita", Newspaper, "/admin/berita"], ["Program", CalendarDays, "/admin/program"],
  ["Pengumuman", Bell, "/admin/pengumuman"], ["Cabang Olahraga", Dumbbell, "/admin/cabang-olahraga"], ["Galeri", GalleryHorizontal, "/admin/galeri"], ["Prestasi", Trophy, "/admin/prestasi"],
  ["Pesan Masuk", Mail, "/admin/pesan-masuk"], ["Pengguna", Users, "/admin/pengguna"], ["Pengaturan", Settings, "/admin/pengaturan"],
] as const;

export default function AdminPage() {
  const active = "Dashboard";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const content = useContentList({ kind: "NEWS", q: debouncedQuery, pageSize: 4 });
  const newsSummary = useContentList({ kind: "NEWS", pageSize: 1 });
  const announcements = useContentList({ kind: "ANNOUNCEMENT", pageSize: 1 });
  const programs = useContentList({ kind: "PROGRAM", pageSize: 1 });
  const branches = useContentList({ kind: "SPORT_BRANCH", pageSize: 1 });
  const galleries = useContentList({ kind: "GALLERY", pageSize: 1 });
  const achievements = useContentList({ kind: "ACHIEVEMENT", pageSize: 1 });
  const messages = useMessagesList({ page: 1 });
  const currentUser = useCurrentUser();
  const posts = content.data?.data ?? [];
  const contentStats = [
    [Newspaper, newsSummary.data?.meta.total, "Total Berita", "/admin/berita", "red"],
    [Bell, announcements.data?.meta.total, "Pengumuman", "/admin/pengumuman", "gold"],
    [GalleryHorizontal, galleries.data?.meta.total, "Album Galeri", "/admin/galeri", "gold"],
    [Medal, achievements.data?.meta.total, "Total Prestasi", "/admin/prestasi", "blue"],
  ] as const;
  const distribution = [
    ["Berita", newsSummary.data?.meta.total ?? 0], ["Pengumuman", announcements.data?.meta.total ?? 0], ["Program", programs.data?.meta.total ?? 0],
    ["Cabor", branches.data?.meta.total ?? 0], ["Galeri", galleries.data?.meta.total ?? 0],
    ["Prestasi", achievements.data?.meta.total ?? 0],
  ] as const;
  const maximum = Math.max(1, ...distribution.map(([, value]) => value));

  return <main className="admin-shell">
    <aside className={sidebarOpen ? "admin-sidebar open" : "admin-sidebar"}>
      <div className="admin-brand"><Image src="/assets/logo-koni.png" alt="KONI" width={46} height={46} /><div><strong>KONI</strong><span>ADMIN PANEL</span></div><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><X /></button></div>
      <div className="admin-org"><Image src="/assets/logo-konawe-selatan.png" alt="Kabupaten Konawe Selatan" width={34} height={40} /><div><small>ORGANISASI</small><strong>KONI Konawe Selatan</strong></div></div>
      <nav className="admin-nav" aria-label="Menu admin"><small>MENU UTAMA</small>{menus.slice(0,7).map(([label,Icon,href])=><Link className={active===label?"active":""} key={label} href={href}><Icon/><span>{label}</span></Link>)}<small>MANAJEMEN</small>{menus.slice(7).map(([label,Icon,href])=><Link className={active===label?"active":""} key={label} href={href}><Icon/><span>{label}</span>{label==="Pesan Masuk"&&Boolean(messages.data?.meta.statusCounts.NEW)&&<b>{messages.data?.meta.statusCounts.NEW}</b>}</Link>)}</nav>
      <div className="admin-help"><CircleHelp/><strong>Panel pengelolaan</strong><span>Gunakan menu di atas untuk mengelola data website.</span></div>
      <Link className="admin-back" href="/"><ArrowLeft/> Kembali ke Website</Link>
      <LogoutButton />
    </aside>

    <section className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-button" onClick={()=>setSidebarOpen(true)} aria-label="Buka menu"><Menu/></button><label><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari berita terbaru..."/></label><div className="admin-top-actions"><div className="admin-user"><div><strong>{currentUser.data?.data.name ?? "Admin KONI"}</strong><small>{currentUser.data?.data.role.replaceAll("_", " ") ?? "Memuat akun…"}</small></div><b>{(currentUser.data?.data.name ?? "AK").split(" ").map((word)=>word[0]).join("").slice(0,2)}</b></div></div></header>

      <div className="admin-content">
        <div className="admin-welcome"><div><span>SELAMAT DATANG KEMBALI</span><h1>{active}</h1><p>Pantau aktivitas dan kelola konten website KONI Konawe Selatan.</p></div><div><Link className="admin-outline" href="/"><Eye/> Lihat Website</Link><Link className="admin-primary" href="/admin/berita"><Plus/> Kelola Konten</Link></div></div>

        <div className="admin-stats">
          {contentStats.map(([Icon,value,label,href,color])=><Link href={href} key={label}><div className={`stat-badge ${color}`}><Icon/></div><div><small>{label}</small><strong>{value ?? "…"}</strong><span>Buka pengelolaan</span></div></Link>)}
        </div>

        <div className="admin-grid">
          <section className="admin-panel traffic-panel"><div className="panel-head"><div><h2>Distribusi Konten</h2><p>Jumlah data per modul dari database</p></div></div><div className="chart" aria-label="Grafik jumlah konten per modul">{distribution.map(([label,value])=><div key={label}><i style={{height:`${Math.max(8,(value/maximum)*100)}%`}}/><span>{label}</span></div>)}</div></section>
          <section className="admin-panel activity-panel"><div className="panel-head"><div><h2>Akses Cepat</h2><p>Kelola modul website yang paling sering digunakan</p></div></div><div className="activity-list">{[[Newspaper,"Kelola berita","/admin/berita"],[Bell,"Kelola pengumuman","/admin/pengumuman"],[CalendarDays,"Kelola program","/admin/program"],[GalleryHorizontal,"Kelola galeri","/admin/galeri"]].map(([Icon,label,href],i)=>{const QuickIcon=Icon as typeof Newspaper;return <Link href={String(href)} key={String(label)}><span className={`activity-dot dot-${i}`}><QuickIcon/></span><div><strong>{String(label)}</strong><p>Buka modul</p></div></Link>})}</div></section>
        </div>

        <section className="admin-panel content-panel"><div className="panel-head"><div><h2>Konten Terbaru</h2><p>Berita langsung dari database</p></div><div className="table-actions"><Link className="admin-primary" href="/admin/berita"><Plus/> Kelola Berita</Link></div></div><div className="admin-table-wrap"><table><thead><tr><th>JUDUL BERITA</th><th>KATEGORI</th><th>TANGGAL</th><th>STATUS</th><th>DILIHAT</th><th /></tr></thead><tbody>{content.isPending&&<tr><td colSpan={6}>Memuat berita…</td></tr>}{content.isError&&<tr><td colSpan={6}>Gagal memuat berita.</td></tr>}{posts.map((post,index)=>{
  const postImage = getContentImage(post.metadata);
  return <tr key={post.id}><td><div className="table-title"><span style={{backgroundPosition: postImage ? "center" : `${14+index*25}% center`, ...(postImage ? { backgroundImage: `url("${postImage.imageUrl}")` } : {})}} role={postImage ? "img" : undefined} aria-label={postImage?.imageAlt}/><strong>{post.title}</strong></div></td><td><span className="category-pill">{post.category || "Umum"}</span></td><td>{new Intl.DateTimeFormat("id-ID",{dateStyle:"medium"}).format(new Date(post.updatedAt))}</td><td><span className={post.status==="DRAFT"?"status-draft":"status-live"}><i/>{statusLabels[post.status]}</span></td><td>{post.viewCount.toLocaleString("id-ID")}</td><td><Link href="/admin/berita" aria-label="Kelola berita"><MoreHorizontal/></Link></td></tr>;
})}</tbody></table></div><div className="table-footer"><span>Menampilkan {posts.length} dari {content.data?.meta.total ?? 0} konten</span><Link href="/admin/berita">Lihat semua</Link></div></section>
      </div>
    </section>

  </main>;
}
