"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Bell, CalendarDays, CheckCircle2, ChevronDown,
  CircleHelp, Dumbbell, Eye, FileText, GalleryHorizontal, LayoutDashboard,
  Mail, Medal, Menu, MoreHorizontal, Newspaper, Plus, Search, Settings,
  Trophy, Upload, Users, X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const menus = [
  ["Dashboard", LayoutDashboard, "/admin"], ["Berita", Newspaper, "/admin/berita"], ["Program", CalendarDays, "/admin/program"],
  ["Cabang Olahraga", Dumbbell, "/admin/cabang-olahraga"], ["Galeri", GalleryHorizontal, "/admin/galeri"], ["Prestasi", Trophy, "/admin/prestasi"],
  ["Pesan Masuk", Mail, "/admin/pesan-masuk"], ["Pengguna", Users, "/admin/pengguna"], ["Pengaturan", Settings, "/admin/pengaturan"],
] as const;

const initialPosts = [
  { title: "KONI Konawe Selatan Lepas Kontingen ke Porprov Sultra 2024", category: "Kegiatan", date: "12 Agu 2024", status: "Terbit", views: "1.240", pos: "14%" },
  { title: "Atlet Renang Konawe Selatan Raih Tiga Medali di Kejurprov", category: "Prestasi", date: "8 Agu 2024", status: "Terbit", views: "968", pos: "42%" },
  { title: "KONI Gelar Pelatihan Pelatih dan Official", category: "Pembinaan", date: "5 Agu 2024", status: "Terbit", views: "742", pos: "68%" },
  { title: "Seleksi Atlet Sepak Bola Jelang Porprov 2024", category: "Pengumuman", date: "28 Jul 2024", status: "Draf", views: "—", pos: "91%" },
];

const activities = [
  ["Berita diterbitkan", "Kontingen Porprov Sultra 2024", "10 menit lalu"],
  ["Galeri diperbarui", "12 foto Kejuaraan Renang", "45 menit lalu"],
  ["Pesan baru diterima", "Permohonan informasi atletik", "2 jam lalu"],
  ["Prestasi ditambahkan", "Medali Kejurda Karate", "Kemarin"],
];

export default function AdminPage() {
  const active = "Dashboard";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const [toast, setToast] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const filtered = useMemo(() => posts.filter((post) => post.title.toLowerCase().includes(debouncedQuery.toLowerCase())), [posts, debouncedQuery]);

  function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "Berita baru");
    setPosts((current) => [{ title, category: String(data.get("category")), date: "Hari ini", status: "Draf", views: "—", pos: "55%" }, ...current]);
    setModalOpen(false);
    setToast("Draf berita berhasil dibuat");
    window.setTimeout(() => setToast(""), 2600);
  }

  return <main className="admin-shell">
    <aside className={sidebarOpen ? "admin-sidebar open" : "admin-sidebar"}>
      <div className="admin-brand"><Image src="/assets/logo-koni.png" alt="KONI" width={46} height={46} /><div><strong>KONI</strong><span>ADMIN PANEL</span></div><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><X /></button></div>
      <div className="admin-org"><Image src="/assets/logo-konawe-selatan.png" alt="Kabupaten Konawe Selatan" width={34} height={40} /><div><small>ORGANISASI</small><strong>KONI Konawe Selatan</strong></div><ChevronDown /></div>
      <nav className="admin-nav" aria-label="Menu admin"><small>MENU UTAMA</small>{menus.slice(0,6).map(([label,Icon,href])=><Link className={active===label?"active":""} key={label} href={href}><Icon/><span>{label}</span></Link>)}<small>MANAJEMEN</small>{menus.slice(6).map(([label,Icon,href])=><Link className={active===label?"active":""} key={label} href={href}><Icon/><span>{label}</span>{label==="Pesan Masuk"&&<b>5</b>}</Link>)}</nav>
      <div className="admin-help"><CircleHelp/><strong>Butuh bantuan?</strong><span>Lihat panduan pengelolaan website.</span><button>Pusat Bantuan</button></div>
      <Link className="admin-back" href="/"><ArrowLeft/> Kembali ke Website</Link>
    </aside>

    <section className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-button" onClick={()=>setSidebarOpen(true)} aria-label="Buka menu"><Menu/></button><label><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari konten, atlet, atau pesan..."/></label><div className="admin-top-actions"><button aria-label="Notifikasi"><Bell/><i>3</i></button><span/><div className="admin-user"><div><strong>Admin KONI</strong><small>Super Administrator</small></div><b>AK</b><ChevronDown/></div></div></header>

      <div className="admin-content">
        <div className="admin-welcome"><div><span>SELAMAT DATANG KEMBALI</span><h1>{active}</h1><p>Pantau aktivitas dan kelola konten website KONI Konawe Selatan.</p></div><div><button className="admin-outline"><Eye/> Lihat Website</button><button className="admin-primary" onClick={()=>setModalOpen(true)}><Plus/> Tambah Konten</button></div></div>

        <div className="admin-stats">
          {[[Newspaper,"48","Total Berita","+6 bulan ini","red"],[GalleryHorizontal,"286","Media Galeri","+24 bulan ini","gold"],[Medal,"74","Total Prestasi","+8 tahun ini","blue"],[Mail,"12","Pesan Masuk","5 belum dibaca","green"]].map(([Icon,value,label,note,color])=>{const I=Icon as typeof Newspaper;return <article key={String(label)}><div className={`stat-badge ${color}`}><I/></div><div><small>{String(label)}</small><strong>{String(value)}</strong><span>{String(note)}</span></div><MoreHorizontal/></article>})}
        </div>

        <div className="admin-grid">
          <section className="admin-panel traffic-panel"><div className="panel-head"><div><h2>Statistik Kunjungan</h2><p>Performa website selama 7 hari terakhir</p></div><button>7 Hari <ChevronDown/></button></div><div className="traffic-meta"><div><strong>8.429</strong><span>Total kunjungan</span></div><div><b>+18,2%</b><span>dibanding minggu lalu</span></div></div><div className="chart" aria-label="Grafik kunjungan mingguan">{[38,58,46,78,63,88,72].map((height,i)=><div key={i}><i style={{height:`${height}%`}}/><span>{["Sen","Sel","Rab","Kam","Jum","Sab","Min"][i]}</span></div>)}</div></section>
          <section className="admin-panel activity-panel"><div className="panel-head"><div><h2>Aktivitas Terbaru</h2><p>Pembaruan terakhir tim admin</p></div><button><MoreHorizontal/></button></div><div className="activity-list">{activities.map(([title,text,time],i)=><article key={title}><span className={`activity-dot dot-${i}`}><CheckCircle2/></span><div><strong>{title}</strong><p>{text}</p><small>{time}</small></div></article>)}</div><button className="view-all">Lihat semua aktivitas</button></section>
        </div>

        <section className="admin-panel content-panel"><div className="panel-head"><div><h2>Konten Terbaru</h2><p>Berita yang baru ditambahkan atau diperbarui</p></div><div className="table-actions"><button>Semua Status <ChevronDown/></button><button className="admin-primary" onClick={()=>setModalOpen(true)}><Plus/> Tambah Berita</button></div></div><div className="admin-table-wrap"><table><thead><tr><th>JUDUL BERITA</th><th>KATEGORI</th><th>TANGGAL</th><th>STATUS</th><th>DILIHAT</th><th /></tr></thead><tbody>{filtered.map(post=><tr key={post.title}><td><div className="table-title"><span style={{backgroundPosition:`${post.pos} center`}}/><strong>{post.title}</strong></div></td><td><span className="category-pill">{post.category}</span></td><td>{post.date}</td><td><span className={post.status==="Terbit"?"status-live":"status-draft"}><i/>{post.status}</span></td><td>{post.views}</td><td><button aria-label="Menu item"><MoreHorizontal/></button></td></tr>)}</tbody></table></div><div className="table-footer"><span>Menampilkan {filtered.length} dari {posts.length} konten</span><div><button>‹</button><button className="active">1</button><button>2</button><button>3</button><button>›</button></div></div></section>
      </div>
    </section>

    {modalOpen&&<div className="admin-modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)setModalOpen(false)}}><form className="admin-modal" onSubmit={createPost}><div className="modal-head"><div><span><FileText/></span><div><h2>Buat Berita Baru</h2><p>Simpan sebagai draf untuk dilengkapi kemudian.</p></div></div><button type="button" onClick={()=>setModalOpen(false)} aria-label="Tutup"><X/></button></div><label>Judul berita<input name="title" required placeholder="Masukkan judul berita"/></label><div className="modal-row"><label>Kategori<select name="category" defaultValue="Kegiatan"><option>Kegiatan</option><option>Prestasi</option><option>Pembinaan</option><option>Pengumuman</option></select></label><label>Tanggal<input type="date" name="date"/></label></div><label>Ringkasan<textarea rows={4} placeholder="Tulis ringkasan singkat..."/></label><label className="upload-box"><Upload/><strong>Unggah gambar utama</strong><span>PNG atau JPG, maksimal 5 MB</span><input type="file" accept="image/*"/></label><div className="modal-actions"><button type="button" onClick={()=>setModalOpen(false)}>Batal</button><button className="admin-primary" type="submit">Simpan Draf</button></div></form></div>}
    {toast&&<div className="admin-toast"><CheckCircle2/><span>{toast}</span></div>}
  </main>;
}
