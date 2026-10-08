import type { Metadata } from "next";
import Image from "next/image";
import { Award, Eye, Flag, HeartHandshake, ShieldCheck, Target, Users } from "lucide-react";
import { PageHero, SiteShell } from "../components/site-chrome";

export const metadata: Metadata = {
  title: "Profil",
  description:
    "Mengenal lebih dekat Komite Olahraga Nasional Indonesia (KONI) Kabupaten Konawe Selatan, visi, misi, dan struktur organisasi pembinaan olahraga.",
  openGraph: {
    title: "Profil | KONI Kabupaten Konawe Selatan",
    description:
      "Mengenal lebih dekat Komite Olahraga Nasional Indonesia (KONI) Kabupaten Konawe Selatan, visi, misi, dan struktur organisasi pembinaan olahraga.",
    url: "/profil",
    images: [{ url: "/assets/logo-koni.png" }],
  },
};

export default function ProfilPage() {
  return <SiteShell><PageHero eyebrow="MENGENAL ORGANISASI" title="Profil" accent="KONI" description="Komite Olahraga Nasional Indonesia Kabupaten Konawe Selatan hadir untuk menyatukan langkah, membina potensi, dan mengantarkan atlet daerah menuju prestasi tertinggi." />
    <section className="inner-section"><div className="container profile-intro"><div><span className="mini-label">TENTANG KAMI</span><h2>Rumah Besar Olahraga<br /><em>Konawe Selatan</em></h2><p>KONI Kabupaten Konawe Selatan merupakan organisasi yang mengoordinasikan pembinaan olahraga prestasi bersama pemerintah daerah, pengurus cabang olahraga, pelatih, dan seluruh insan olahraga.</p><p>Kami membangun ekosistem pembinaan yang terukur, inklusif, dan berkelanjutan agar setiap atlet memiliki kesempatan berkembang dari tingkat daerah hingga nasional.</p></div><div className="leader-card"><div className="leader-photo"><Image src="/assets/ketua-koni.png" alt="Ketua KONI Konawe Selatan" width={944} height={1417} /></div><div><small>KETUA KONI KABUPATEN KONAWE SELATAN</small><h3>H. Wahyu Ade Pratama Imran</h3><p>“Prestasi lahir dari kerja bersama, disiplin, dan pembinaan yang konsisten.”</p></div></div></div></section>
    <section className="inner-section soft-section"><div className="container"><div className="center-title"><span className="mini-label">ARAH ORGANISASI</span><h2>Visi dan Misi</h2></div><div className="vision-grid"><article className="vision-card featured"><Eye /><small>VISI</small><h3>Konawe Selatan Berprestasi</h3><p>Menjadi organisasi olahraga yang profesional, transparan, dan berdaya saing dalam mewujudkan prestasi olahraga yang membanggakan.</p></article><article className="vision-card"><Target /><small>MISI 01</small><h3>Pembinaan Berjenjang</h3><p>Mengembangkan sistem pembinaan atlet sejak usia dini secara terukur dan berkelanjutan.</p></article><article className="vision-card"><Users /><small>MISI 02</small><h3>Sinergi Organisasi</h3><p>Memperkuat kolaborasi dengan cabang olahraga, pemerintah, sekolah, dan masyarakat.</p></article><article className="vision-card"><Award /><small>MISI 03</small><h3>Prestasi Unggul</h3><p>Meningkatkan kualitas atlet, pelatih, serta sarana pendukung untuk prestasi lebih tinggi.</p></article></div></div></section>
    <section className="inner-section"><div className="container"><div className="center-title"><span className="mini-label">NILAI KAMI</span><h2>Fondasi Dalam Bergerak</h2></div><div className="principle-grid">{[[ShieldCheck,"Integritas","Jujur, transparan, dan bertanggung jawab."],[HeartHandshake,"Kebersamaan","Tumbuh melalui kolaborasi dan saling mendukung."],[Flag,"Nasionalisme","Mengharumkan daerah sebagai bagian dari Indonesia."],[Award,"Profesionalisme","Bekerja dengan standar, disiplin, dan kompetensi."]].map(([Icon,title,text])=>{const I=Icon as typeof Award;return <article key={String(title)}><I/><h3>{String(title)}</h3><p>{String(text)}</p></article>})}</div></div></section>
  </SiteShell>;
}
