"use client";

import { Camera, Images, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { usePublicContent } from "@/hooks/use-public-content";
import { excerptFromRichText } from "@/lib/rich-text";
import { PageHero, SiteShell } from "../components/site-chrome";

export default function GaleriPage() {
  const [active, setActive] = useState("Semua");
  const gallery = usePublicContent({ kind: "GALLERY", pageSize: 100 });
  const filters = useMemo(() => ["Semua", ...new Set((gallery.data?.data ?? []).map((item) => item.category).filter((value): value is string => Boolean(value)))], [gallery.data?.data]);
  const items = (gallery.data?.data ?? []).filter((item) => active === "Semua" || item.category === active);
  return <SiteShell><PageHero eyebrow="DOKUMENTASI KEGIATAN" title="Galeri" accent="KONI" description="Rekam jejak perjuangan, kebersamaan, dan prestasi insan olahraga Kabupaten Konawe Selatan."/><section className="inner-section"><div className="container"><div className="gallery-page-head"><div><span className="mini-label">MOMEN PILIHAN</span><h2>Cerita Dalam Setiap Bingkai</h2></div><div className="gallery-tabs">{filters.map((filter)=><button className={active===filter?"active":""} onClick={()=>setActive(filter)} key={filter}>{filter}</button>)}</div></div>
    {gallery.isPending && <p className="empty-state">Memuat galeri…</p>}{gallery.isError && <p className="empty-state">Galeri belum dapat dimuat.</p>}{!gallery.isPending && !gallery.isError && items.length === 0 && <p className="empty-state">Belum ada album pada kategori ini.</p>}
    <div className="gallery-page-grid">{items.map((item,index)=><article className={`gallery-photo gallery-photo-${index%12}`} key={item.id} title={excerptFromRichText(item.summary, 180) || item.title}><div style={{backgroundPosition:`${8+index*8}% center`}}/><span>{index%4===0?<Play fill="currentColor"/>:<Camera/>}<b>{item.title}</b></span></article>)}</div><div className="gallery-summary"><Images/><div><strong>{gallery.data?.meta.total ?? 0}</strong><span>Album kegiatan dipublikasikan dalam arsip KONI Konawe Selatan</span></div></div></div></section></SiteShell>;
}
