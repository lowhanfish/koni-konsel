"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Bell, CalendarDays, CheckCircle2, ChevronDown,
  CircleHelp, Dumbbell, Eye, GalleryHorizontal, LayoutDashboard,
  Mail, Medal, Menu, MoreHorizontal, Newspaper, Plus, Search, Settings,
  Trophy, Users, X,
} from "lucide-react";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useContentList } from "@/hooks/use-content";
import { useCurrentUser } from "@/hooks/use-current-user";
import { statusLabels } from "@/lib/content";
import { LogoutButton } from "./logout-button";

const menus = [
  ["Dashboard", LayoutDashboard, "/admin"], ["Berita", Newspaper, "/admin/berita"], ["Program", CalendarDays, "/admin/program"],
  ["Cabang Olahraga", Dumbbell, "/admin/cabang-olahraga"], ["Galeri", GalleryHorizontal, "/admin/galeri"], ["Prestasi", Trophy, "/admin/prestasi"],
  ["Pesan Masuk", Mail, "/admin/pesan-masuk"], ["Pengguna", Users, "/admin/pengguna"], ["Pengaturan", Settings, "/admin/pengaturan"],
] as const;

const activities = [
  ["Berita diterbitkan", "Kontingen Porprov Sultra 2024", "10 menit lalu"],
  ["Galeri diperbarui", "12 foto Kejuaraan Renang", "45 menit lalu"],
  ["Pesan baru diterima", "Permohonan informasi atletik", "2 jam lalu"],
  ["Prestasi ditambahkan", "Medali Kejurda Karate", "Kemarin"],
];

export default function AdminPage() {
  const active = "Dashboard";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const content = useContentList({ kind: "NEWS", q: debouncedQuery, pageSize: 4 });
  const currentUser = useCurrentUser();
  const posts = content.data?.data ?? [];

  return <main className="admin-shell">
    <aside className={sidebarOpen ? "admin-sidebar open" : "admin-sidebar"}>
      <div className="admin-brand"><Image src="/assets/logo-koni.png" alt="KONI" width={46} height={46} /><div><strong>KONI</strong><span>ADMIN PANEL</span></div><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><X /></button></div>
      <div className="admin-org"><Image src="/assets/logo-konawe-selatan.png" alt="Kabupaten Konawe Selatan" width={34} height={40} /><div><small>ORGANISASI</small><strong>KONI Konawe Selatan</strong></div><ChevronDown /></div>
      <nav className="admin-nav" aria-label="Menu admin"><small>MENU UTAMA</small>{menus.slice(0,6).map(([label,Icon,href])=><Link className={active===label?"active":""} key={label} href={href}><Icon/><span>{label}</span></Link>)}<small>MANAJEMEN</small>{menus.slice(6).map(([label,Icon,href])=><Link className={active===label?"active":""} key={label} href={href}><Icon/><span>{label}</span>{label==="Pesan Masuk"&&<b>5</b>}</Link>)}</nav>
      <div className="admin-help"><CircleHelp/><strong>Butuh bantuan?</strong><span>Lihat panduan pengelolaan website.</span><button>Pusat Bantuan</button></div>
      <Link className="admin-back" href="/"><ArrowLeft/> Kembali ke Website</Link>
      <LogoutButton />
    </aside>

    <section className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-button" onClick={()=>setSidebarOpen(true)} aria-label="Buka menu"><Menu/></button><label><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari berita terbaru..."/></label><div className="admin-top-actions"><button aria-label="Notifikasi"><Bell/><i>3</i></button><span/><div className="admin-user"><div><strong>{currentUser.data?.data.name ?? "Admin KONI"}</strong><small>{currentUser.data?.data.role.replaceAll("_", " ") ?? "Memuat akun…"}</small></div><b>{(currentUser.data?.data.name ?? "AK").split(" ").map((word)=>word[0]).join("").slice(0,2)}</b><ChevronDown/></div></div></header>

      <div className="admin-content">
        <div className="admin-welcome"><div><span>SELAMAT DATANG KEMBALI</span><h1>{active}</h1><p>Pantau aktivitas dan kelola konten website KONI Konawe Selatan.</p></div><div><Link className="admin-outline" href="/"><Eye/> Lihat Website</Link><Link className="admin-primary" href="/admin/berita"><Plus/> Kelola Konten</Link></div></div>

        <div className="admin-stats">
          {[[Newspaper,String(content.data?.meta.total ?? 0),"Total Berita","Dari database","red"],[GalleryHorizontal,"—","Media Galeri","Buka menu galeri","gold"],[Medal,"—","Total Prestasi","Buka menu prestasi","blue"],[Mail,"—","Pesan Masuk","Modul berikutnya","green"]].map(([Icon,value,label,note,color])=>{const I=Icon as typeof Newspaper;return <article key={String(label)}><div className={`stat-badge ${color}`}><I/></div><div><small>{String(label)}</small><strong>{String(value)}</strong><span>{String(note)}</span></div><MoreHorizontal/></article>})}
        </div>

        <div className="admin-grid">
          <section className="admin-panel traffic-panel"><div className="panel-head"><div><h2>Statistik Kunjungan</h2><p>Performa website selama 7 hari terakhir</p></div><button>7 Hari <ChevronDown/></button></div><div className="traffic-meta"><div><strong>8.429</strong><span>Total kunjungan</span></div><div><b>+18,2%</b><span>dibanding minggu lalu</span></div></div><div className="chart" aria-label="Grafik kunjungan mingguan">{[38,58,46,78,63,88,72].map((height,i)=><div key={i}><i style={{height:`${height}%`}}/><span>{["Sen","Sel","Rab","Kam","Jum","Sab","Min"][i]}</span></div>)}</div></section>
          <section className="admin-panel activity-panel"><div className="panel-head"><div><h2>Aktivitas Terbaru</h2><p>Pembaruan terakhir tim admin</p></div><button><MoreHorizontal/></button></div><div className="activity-list">{activities.map(([title,text,time],i)=><article key={title}><span className={`activity-dot dot-${i}`}><CheckCircle2/></span><div><strong>{title}</strong><p>{text}</p><small>{time}</small></div></article>)}</div><button className="view-all">Lihat semua aktivitas</button></section>
        </div>

        <section className="admin-panel content-panel"><div className="panel-head"><div><h2>Konten Terbaru</h2><p>Berita langsung dari database</p></div><div className="table-actions"><Link className="admin-primary" href="/admin/berita"><Plus/> Kelola Berita</Link></div></div><div className="admin-table-wrap"><table><thead><tr><th>JUDUL BERITA</th><th>KATEGORI</th><th>TANGGAL</th><th>STATUS</th><th>DILIHAT</th><th /></tr></thead><tbody>{content.isPending&&<tr><td colSpan={6}>Memuat berita…</td></tr>}{content.isError&&<tr><td colSpan={6}>Gagal memuat berita.</td></tr>}{posts.map((post,index)=><tr key={post.id}><td><div className="table-title"><span style={{backgroundPosition:`${14+index*25}% center`}}/><strong>{post.title}</strong></div></td><td><span className="category-pill">{post.category || "Umum"}</span></td><td>{new Intl.DateTimeFormat("id-ID",{dateStyle:"medium"}).format(new Date(post.updatedAt))}</td><td><span className={post.status==="DRAFT"?"status-draft":"status-live"}><i/>{statusLabels[post.status]}</span></td><td>{post.viewCount.toLocaleString("id-ID")}</td><td><Link href="/admin/berita" aria-label="Kelola berita"><MoreHorizontal/></Link></td></tr>)}</tbody></table></div><div className="table-footer"><span>Menampilkan {posts.length} dari {content.data?.meta.total ?? 0} konten</span><Link href="/admin/berita">Lihat semua</Link></div></section>
      </div>
    </section>

  </main>;
}
