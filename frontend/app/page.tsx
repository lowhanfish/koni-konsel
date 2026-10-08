"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Bike, Camera, Dumbbell, FileText, Goal, Images, MessageCircle,
  Mail, MapPin, Medal, Menu, Newspaper, Phone, Play, Search,
  ShieldCheck, Target, Trophy, Users, Video, Volleyball, Waves, X, Zap,
} from "lucide-react";
import { useState } from "react";
import { fallbackSettings, useSettings } from "@/hooks/use-settings";
import { usePublicContent } from "@/hooks/use-public-content";
import { getContentImage, getGalleryMedia } from "@/lib/content";
import { excerptFromRichText } from "@/lib/rich-text";
import { navItems } from "./components/site-chrome";

const quickLinks = [
  { icon: Users, title: "Profil KONI", text: "Sejarah, visi, misi dan struktur organisasi", href: "/profil" },
  { icon: Medal, title: "Cabang Olahraga", text: "Daftar seluruh cabang olahraga", href: "/cabang-olahraga" },
  { icon: Target, title: "Program", text: "Program pembinaan dan pengembangan", href: "/program" },
  { icon: Newspaper, title: "Berita", text: "Informasi terbaru seputar KONI", href: "/berita" },
  { icon: Images, title: "Galeri", text: "Dokumentasi kegiatan dan event", href: "/galeri" },
  { icon: FileText, title: "Prestasi", text: "Capaian atlet dan kontingen daerah", href: "/prestasi" },
];

const programs = [
  { title: "Pembinaan Atlet Muda", text: "Program pembinaan atlet usia dini dan berkelanjutan.", position: "18%" },
  { title: "Pelatihan & Pemusatan Latihan", text: "Peningkatan kualitas atlet melalui pelatihan terstruktur.", position: "42%" },
  { title: "Sarana dan Prasarana", text: "Pengembangan fasilitas olahraga yang representatif.", position: "68%" },
  { title: "Kejuaraan Daerah", text: "Penyelenggaraan event olahraga secara rutin dan berjenjang.", position: "82%" },
  { title: "Sport for All", text: "Gerakan masyarakat hidup sehat melalui olahraga.", position: "94%" },
];

const sports = [
  { icon: Zap, name: "Atletik" }, { icon: Waves, name: "Renang" },
  { icon: Goal, name: "Bulutangkis" }, { icon: Goal, name: "Sepak Bola" },
  { icon: Volleyball, name: "Bola Voli" }, { icon: Target, name: "Bola Basket" },
  { icon: Dumbbell, name: "Tinju" }, { icon: ShieldCheck, name: "Karate" },
  { icon: Zap, name: "Pencak Silat" }, { icon: Bike, name: "Sepeda" },
  { icon: Dumbbell, name: "Angkat Besi" }, { icon: Menu, name: "Lainnya" },
];

const news = [
  { date: "12 Agustus 2024", title: "KONI Konawe Selatan Lepas Kontingen ke Porprov Sultra 2024", excerpt: "Sebanyak 120 atlet Konawe Selatan resmi dilepas untuk mengikuti ajang olahraga tingkat provinsi.", position: "14%" },
  { date: "8 Agustus 2024", title: "Atlet Renang Konawe Selatan Raih 3 Medali di Kejurprov", excerpt: "Kontingen renang berhasil meraih tiga medali pada kejuaraan tingkat Sulawesi Tenggara.", position: "43%" },
  { date: "5 Agustus 2024", title: "KONI Gelar Pelatihan Pelatih dan Official", excerpt: "Pelatihan peningkatan kapasitas pelatih dan official cabang olahraga digelar di Andoolo.", position: "72%" },
  { date: "28 Juli 2024", title: "Seleksi Atlet Sepak Bola Jelang Porprov 2024", excerpt: "KONI bersama Askab PSSI Konawe Selatan menggelar seleksi atlet untuk persiapan Porprov.", position: "91%" },
];

const galleryFilters = ["Semua", "Kejuaraan", "Pembinaan", "Sosialisasi", "Kunjungan"];

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="KONI Konawe Selatan - Beranda">
      <Image src="/assets/logo-konawe-selatan.png" alt="Lambang Kabupaten Konawe Selatan" width={46} height={54} priority />
      <span className="brand-divider" />
      <Image src="/assets/logo-koni.png" alt="Logo KONI" width={50} height={50} priority />
      <span className="brand-copy"><strong>KONI</strong><small>KABUPATEN KONAWE SELATAN</small></span>
    </Link>
  );
}

function SectionTitle({ children, note }: { children: React.ReactNode; note?: string }) {
  return <div className="section-heading"><div><h2>{children}</h2>{note && <p>{note}</p>}</div></div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState("Semua");
  const settingsQuery = useSettings();
  const settings = settingsQuery.data?.data ?? fallbackSettings;
  const programContent = usePublicContent({ kind: "PROGRAM", pageSize: 5 });
  const branchContent = usePublicContent({ kind: "SPORT_BRANCH", pageSize: 12 });
  const newsContent = usePublicContent({ kind: "NEWS", pageSize: 4 });
  const galleryContent = usePublicContent({ kind: "GALLERY", pageSize: 11 });
  const achievementContent = usePublicContent({ kind: "ACHIEVEMENT", pageSize: 100 });
  const socialLinks = [[settings.facebookUrl, MessageCircle, "Facebook"], [settings.instagramUrl, Camera, "Instagram"], [settings.youtubeUrl, Video, "YouTube"]] as const;
  const hasSocialLinks = socialLinks.some(([url]) => Boolean(url));
  const programCards = programContent.data ? programContent.data.data.map((item, index) => ({ title: item.title, text: excerptFromRichText(item.summary, 150) || "Program pembinaan KONI Konawe Selatan.", position: `${18 + index * 19}%`, href: `/program/${item.slug}` })) : programs.map((item) => ({ ...item, href: "/program" }));
  const sportCards = branchContent.data ? branchContent.data.data.map((item, index) => ({ icon: sports[index % sports.length].icon, name: item.title, href: `/cabang-olahraga/${item.slug}` })) : sports.map((item) => ({ ...item, href: "/cabang-olahraga" }));
  const newsCards = newsContent.data ? newsContent.data.data.map((item, index) => {
    const image = getContentImage(item.metadata);
    return {
      date: new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(item.publishedAt ?? item.updatedAt)),
      title: item.title,
      excerpt: excerptFromRichText(item.summary, 190) || "Informasi terbaru KONI Kabupaten Konawe Selatan.",
      position: `${14 + index * 26}%`,
      href: `/berita/${item.slug}`,
      image,
    };
  }) : news.map((item) => ({ ...item, href: "/berita", image: null }));
  const galleryItems = galleryContent.data ? galleryContent.data.data : [];
  const galleryFilterOptions = galleryContent.data ? ["Semua", ...new Set(galleryItems.map((item) => item.category).filter((value): value is string => Boolean(value)))] : galleryFilters;
  const achievements = achievementContent.data?.data ?? [];
  const achievementCategories = new Set(achievements.map((item) => item.category).filter(Boolean)).size;

  return (
    <main id="beranda">
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Navigasi utama">
            {navItems.map(([item, href]) => (
              <Link className={href === "/" ? "active" : ""} key={item} href={href} onClick={() => setMenuOpen(false)}>{item}</Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="icon-button" href="/berita" aria-label="Cari berita"><Search size={17} /></Link>
            <Link className="button button-small" href="/kontak">Hubungi Kami</Link>
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Buka menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-flag hero-flag-top" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">KOMITE OLAHRAGA NASIONAL INDONESIA</p>
            <h1>KONAWE SELATAN <span>BERGERAK</span> <em>BERPRESTASI</em></h1>
            <p className="hero-lead">Bersama membangun olahraga yang maju, berkarakter, dan berprestasi untuk Konawe Selatan yang lebih baik.</p>
            <div className="hero-buttons">
              <Link className="button" href="/profil">Lihat Profil KONI <ArrowRight size={17} /></Link>
              <Link className="button button-ghost" href="/program">Program Unggulan <ArrowRight size={17} /></Link>
            </div>
          </div>
          <div className="chairman-wrap">
            <div className="chairman-glow" />
            <Image className="chairman" src="/assets/ketua-koni.png" alt="Ketua KONI Kabupaten Konawe Selatan" width={944} height={1417} priority />
            <div className="chairman-name"><strong>H. WAHYU ADE PRATAMA IMRAN</strong><span>KETUA KONI KABUPATEN KONAWE SELATAN</span></div>
          </div>
        </div>
        <div className="hero-flag hero-flag-bottom" />
      </section>

      <section className="quick-nav container" aria-label="Menu layanan">
        {quickLinks.map(({ icon: Icon, title, text, href }, index) => (
          <Link href={href} className="quick-card" key={title}><Icon className={index % 2 ? "gold" : "red"} size={39} strokeWidth={2.4} /><strong>{title}</strong><span>{text}</span><i><ArrowRight size={14} /></i></Link>
        ))}
      </section>

      <section className="about section" id="tentang">
        <div className="container about-grid">
          <div className="about-copy">
            <p className="section-kicker">TENTANG <span>KONI</span></p>
            <h2>KABUPATEN KONAWE SELATAN</h2>
            <p>KONI Kabupaten Konawe Selatan adalah wadah pembinaan, pengembangan, dan koordinasi olahraga prestasi di daerah dengan semangat kebersamaan, profesionalisme, dan integritas untuk mewujudkan atlet-atlet berprestasi yang mengharumkan nama Konawe Selatan.</p>
            <Link className="button" href="/profil">Selengkapnya <ArrowRight size={17} /></Link>
          </div>
          <div className="office-card">
            <Image
              src="/assets/gedung-koni.jpg"
              alt="Gedung Sekretariat KONI Kabupaten Konawe Selatan"
              width={1024}
              height={575}
              className="office-photo"
              priority
            />
            <div className="office-badge">
              <Image src="/assets/logo-koni.png" alt="Logo KONI" width={38} height={38} />
              <div>
                <strong>SEKRETARIAT KONI</strong>
                <span>KABUPATEN KONAWE SELATAN</span>
              </div>
            </div>
          </div>
        </div>
        <div className="container value-grid">
          {[[Zap, "Pembinaan Atlet", "Mencetak atlet unggul dan berkarakter sejak dini."], [Medal, "Pengembangan Cabor", "Mendorong pertumbuhan seluruh cabang olahraga di Konawe Selatan."], [Trophy, "Prestasi Daerah", "Meraih prestasi di tingkat daerah, provinsi, nasional dan internasional."], [Users, "Olahraga untuk Semua", "Mewujudkan masyarakat sehat, bugar dan berdaya saing."]].map(([Icon, title, text], index) => { const ValueIcon = Icon as typeof Zap; return <article className="value-card" key={String(title)}><ValueIcon className={index % 2 ? "gold" : "red"} size={45} /><h3>{String(title)}</h3><p>{String(text)}</p></article>; })}
        </div>
      </section>

      <section className="section" id="program"><div className="container">
        <div className="title-row"><SectionTitle note="Berbagai program strategis untuk mendukung pembinaan atlet, pengembangan cabang olahraga, dan peningkatan prestasi olahraga di Konawe Selatan.">PROGRAM UNGGULAN</SectionTitle><Link className="outline-link" href="/program">Lihat Semua Program <ArrowRight size={16} /></Link></div>
        <div className="program-grid">{programCards.map((program) => <Link className="program-card" href={program.href} key={program.title}><div className="sports-image" style={{ backgroundPosition: `${program.position} center` }} /><div><h3>{program.title}</h3><p>{program.text}</p></div></Link>)}</div>
      </div></section>

      <section className="section sports-section" id="cabor"><div className="container">
        <div className="title-row"><SectionTitle>CABANG OLAHRAGA</SectionTitle><Link className="outline-link" href="/cabang-olahraga">Lihat Semua Cabor <ArrowRight size={16} /></Link></div>
        <div className="sport-list">{sportCards.map(({ icon: Icon, name, href }, index) => <Link href={href} className="sport-item" key={name}><span className={`sport-icon sport-${index % 5}`}><Icon size={27} /></span><small>{name}</small></Link>)}</div>
      </div></section>

      <section className="section achievement-section" id="prestasi"><div className="container">
        <div className="title-row"><SectionTitle note="Capaian membanggakan atlet Konawe Selatan di berbagai ajang kejuaraan.">PRESTASI</SectionTitle><Link className="outline-link" href="/prestasi">Lihat Semua Prestasi <ArrowRight size={16} /></Link></div>
        <div className="achievement-banner"><div className="stats">{[[Trophy, String(achievements.length), "Prestasi"], [Medal, String(achievementCategories), "Cabang"], [Users, String(achievementContent.data?.meta.total ?? 0), "Publikasi"]].map(([Icon, number, label]) => { const StatIcon = Icon as typeof Trophy; return <div className="stat" key={String(label)}><StatIcon /><strong>{String(number)}</strong><span>{String(label)}</span></div>; })}</div><div className="achievement-copy"><small>Atlet Konawe Selatan</small><strong>Menuju Prestasi</strong><em>Lebih Tinggi!</em></div></div>
      </div></section>

      <section className="section" id="berita"><div className="container">
        <div className="title-row"><SectionTitle>BERITA TERBARU</SectionTitle><Link className="outline-link" href="/berita">Lihat Semua Berita <ArrowRight size={16} /></Link></div>
        <div className="news-grid">
          {newsCards.map((item) => (
            <article className="news-card" key={item.title}>
              <div
                className="sports-image news-image"
                style={{
                  backgroundPosition: item.image ? "center" : `${item.position} center`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  ...(item.image ? { backgroundImage: `url("${item.image.imageUrl}")` } : {}),
                }}
                role={item.image ? "img" : undefined}
                aria-label={item.image?.imageAlt}
              />
              <div className="news-body">
                <time>{item.date}</time>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <Link href={item.href} aria-label={`Baca ${item.title}`}><ArrowRight size={18} /></Link>
              </div>
            </article>
          ))}
        </div>
      </div></section>

      <section className="section gallery-section" id="galeri"><div className="container">
        <div className="gallery-head"><SectionTitle>GALERI KEGIATAN</SectionTitle><div className="filter-list">{galleryFilterOptions.map((filter) => <button key={filter} className={galleryFilter === filter ? "active" : ""} onClick={() => setGalleryFilter(filter)}>{filter}</button>)}</div></div>
        <div className="gallery-grid">
          {galleryItems.filter((item) => galleryFilter === "Semua" || item.category === galleryFilter).map((item, index) => {
            const media = getGalleryMedia(item.metadata);
            const coverUrl = media?.imageUrl;
            const isVideo = media?.mediaType === "VIDEO";
            return (
              <Link
                className={`gallery-item item-${index}`}
                key={item.id}
                href="/galeri"
                title={item.title}
              >
                <div
                  className="sports-image"
                  style={
                    coverUrl
                      ? { backgroundImage: `url("${coverUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { backgroundPosition: `${8 + index * 9}% center` }
                  }
                />
                <span className="gallery-badge">
                  {isVideo ? <Play size={13} fill="currentColor" /> : <Camera size={13} />}
                  {isVideo ? "Video" : item.category || "Dokumentasi"}
                </span>
              </Link>
            );
          })}
          <Link className="gallery-more" href="/galeri"><Images size={32} /><span>Lihat<br />Lebih Banyak</span><ArrowRight size={20} /></Link>
        </div>
      </div></section>

      <section className="join-section"><div className="container join-inner"><div><h2>BERSAMA MEMAJUKAN<br />OLAHRAGA KONAWE SELATAN</h2><p>Mari bersinergi untuk mencetak lebih banyak atlet berprestasi dan mewujudkan Konawe Selatan yang sehat, maju, dan membanggakan.</p></div><Link className="button button-gold" href="/kontak">Bergabung Bersama Kami <ArrowRight size={17} /></Link></div></section>

      <section className="partners"><div className="container partner-row"><strong>MITRA & DUKUNGAN</strong><div><Image src="/assets/logo-konawe-selatan.png" alt="Pemerintah Kabupaten Konawe Selatan" width={38} height={45} /><span>PEMERINTAH<br /><b>KABUPATEN KONAWE SELATAN</b></span></div><div><Image src="/assets/logo-koni.png" alt="KONI Sulawesi Tenggara" width={42} height={42} /><span>KONI<br /><b>PROVINSI SULAWESI TENGGARA</b></span></div><div><ShieldCheck /><span>KEMENPORA<br /><b>REPUBLIK INDONESIA</b></span></div><div><Medal /><span>DISPORA<br /><b>KABUPATEN KONAWE SELATAN</b></span></div></div></section>

      <footer id="kontak">
        <div className="container footer-grid">
          <div className="footer-brand"><Brand /><p>{settings.description}</p><div className="socials">{hasSocialLinks ? socialLinks.map(([url, Icon, label]) => url && <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={`${label} resmi KONI Konawe Selatan`}><Icon /></a>) : <><a href={`mailto:${settings.email}`} aria-label="Kirim email ke KONI Konawe Selatan"><Mail /></a><a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} aria-label="Telepon KONI Konawe Selatan"><Phone /></a></>}</div></div>
          <div><h3>Quick Menu</h3><nav className="footer-nav">{navItems.map(([item, href]) => <Link key={item} href={href}>{item}</Link>)}</nav></div>
          <div><h3>Kontak Kami</h3><ul className="contact-list"><li><MapPin />{settings.address}</li><li><Mail />{settings.email}</li><li><Phone />{settings.phone}</li></ul></div>
          <div><h3>Lokasi</h3><div className="map-card"><MapPin fill="currentColor" /><div><strong>KONI</strong><span>Konawe Selatan</span></div></div><a className="footer-map-link" href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`} target="_blank" rel="noreferrer">Lihat di Google Maps <ArrowRight size={15} /></a></div>
        </div>
        <div className="container copyright"><span>© {new Date().getFullYear()} {settings.organizationName}. All rights reserved.</span></div>
      </footer>
    </main>
  );
}
