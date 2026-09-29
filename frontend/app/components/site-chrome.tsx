"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Mail, MapPin, Medal, Menu, MessageCircle, Phone, Search, ShieldCheck, Video, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const navItems = [
  ["Beranda", "/"], ["Profil", "/profil"], ["Program", "/program"],
  ["Cabang Olahraga", "/cabang-olahraga"], ["Berita", "/berita"],
  ["Galeri", "/galeri"], ["Prestasi", "/prestasi"], ["Kontak", "/kontak"],
] as const;

export function Brand() {
  return <Link className="brand" href="/" aria-label="KONI Konawe Selatan - Beranda">
    <Image src="/assets/logo-konawe-selatan.png" alt="Lambang Kabupaten Konawe Selatan" width={46} height={54} priority />
    <span className="brand-divider" />
    <Image src="/assets/logo-koni.png" alt="Logo KONI" width={50} height={50} priority />
    <span className="brand-copy"><strong>KONI</strong><small>KABUPATEN KONAWE SELATAN</small></span>
  </Link>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="container header-inner">
      <Brand />
      <nav className={open ? "nav-links open" : "nav-links"} aria-label="Navigasi utama">
        {navItems.map(([label, href]) => <Link className={pathname === href ? "active" : ""} key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
      <div className="header-actions"><button className="icon-button" aria-label="Cari"><Search size={17} /></button><Link className="button button-small" href="/kontak">Hubungi Kami</Link><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Buka menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button></div>
    </div>
  </header>;
}

export function PageHero({ eyebrow, title, accent, description }: { eyebrow: string; title: string; accent?: string; description: string }) {
  return <section className="inner-hero"><div className="inner-hero-overlay" /><div className="container inner-hero-content"><p>{eyebrow}</p><h1>{title} {accent && <span>{accent}</span>}</h1><div className="breadcrumb"><Link href="/">Beranda</Link><ArrowRight size={14} /><span>{title}</span></div><p className="inner-description">{description}</p></div></section>;
}

export function SiteFooter() {
  return <><section className="partners"><div className="container partner-row"><strong>MITRA & DUKUNGAN</strong><div><Image src="/assets/logo-konawe-selatan.png" alt="Pemerintah Kabupaten Konawe Selatan" width={38} height={45} /><span>PEMERINTAH<br /><b>KABUPATEN KONAWE SELATAN</b></span></div><div><Image src="/assets/logo-koni.png" alt="KONI Sulawesi Tenggara" width={42} height={42} /><span>KONI<br /><b>PROVINSI SULAWESI TENGGARA</b></span></div><div><ShieldCheck /><span>KEMENPORA<br /><b>REPUBLIK INDONESIA</b></span></div><div><Medal /><span>DISPORA<br /><b>KABUPATEN KONAWE SELATAN</b></span></div></div></section>
  <footer><div className="container footer-grid"><div className="footer-brand"><Brand /><p>Bersama memajukan olahraga, mencetak atlet berprestasi, dan mengharumkan nama Konawe Selatan di tingkat daerah, nasional, dan internasional.</p><div className="socials"><a href="#" aria-label="Facebook"><MessageCircle /></a><a href="#" aria-label="Instagram"><Camera /></a><a href="#" aria-label="Youtube"><Video /></a></div></div><div><h3>Quick Menu</h3><nav className="footer-nav">{navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav></div><div><h3>Kontak Kami</h3><ul className="contact-list"><li><MapPin />Jl. Poros Andoolo, Kecamatan Andoolo, Kabupaten Konawe Selatan, Sulawesi Tenggara</li><li><Mail />konikonsel@gmail.com</li><li><Phone />0821 1000 9090</li></ul></div><div><h3>Lokasi</h3><div className="map-card"><MapPin fill="currentColor" /><div><strong>KONI</strong><span>Konawe Selatan</span></div></div><a className="footer-map-link" href="https://maps.google.com/?q=Andoolo+Konawe+Selatan" target="_blank" rel="noreferrer">Lihat di Google Maps <ArrowRight size={15} /></a></div></div><div className="container copyright"><span>© 2024 KONI Kabupaten Konawe Selatan. All rights reserved.</span><span>Kebijakan Privasi &nbsp;|&nbsp; Syarat & Ketentuan</span></div></footer></>;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <main><SiteHeader />{children}<SiteFooter /></main>;
}
