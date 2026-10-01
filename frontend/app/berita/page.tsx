"use client";

import { ArrowRight, CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePublicContent } from "@/hooks/use-public-content";
import { excerptFromRichText } from "@/lib/rich-text";
import { PageHero, SiteShell } from "../components/site-chrome";

function formatDate(value: string | null, fallback: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value ?? fallback));
}

export default function BeritaPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const news = usePublicContent({ kind: "NEWS", q: debouncedQuery, pageSize: 24 });
  const [featured, ...articles] = news.data?.data ?? [];

  return <SiteShell><PageHero eyebrow="KABAR TERKINI" title="Berita" accent="KONI" description="Informasi terbaru tentang atlet, kejuaraan, pembinaan, organisasi, dan perkembangan olahraga di Kabupaten Konawe Selatan."/><section className="inner-section"><div className="container"><div className="news-toolbar"><div><span className="mini-label">RUANG INFORMASI</span><h2>Kabar Terbaru</h2></div><label><Search/><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari berita" placeholder="Cari berita..."/></label></div>
    {news.isPending && <p className="empty-state">Memuat berita…</p>}
    {news.isError && <p className="empty-state">Berita belum dapat dimuat. Silakan coba kembali.</p>}
    {!news.isPending && !news.isError && !featured && <p className="empty-state">Tidak ada berita yang cocok dengan pencarian “{query}”.</p>}
    {featured && <><div className="featured-news"><div className="feature-image"/><div><span className="news-tag">{featured.category || "BERITA UTAMA"}</span><small><CalendarDays/> {formatDate(featured.publishedAt, featured.updatedAt)}</small><h2>{featured.title}</h2><p>{excerptFromRichText(featured.summary, 260) || "Informasi terbaru KONI Kabupaten Konawe Selatan."}</p><Link href={`/berita/${featured.slug}`}>Baca selengkapnya <ArrowRight size={17}/></Link></div></div><div className="article-grid">{articles.map((item, index) => <article key={item.id}><div className="article-image" style={{backgroundPosition:`${16+index*13}% center`}}/><div><span className="news-tag">{item.category || "INFORMASI"}</span><small>{formatDate(item.publishedAt, item.updatedAt)}</small><h3>{item.title}</h3><p>{excerptFromRichText(item.summary, 170) || "Berita dan perkembangan terbaru olahraga Konawe Selatan."}</p><Link href={`/berita/${item.slug}`} aria-label={`Baca ${item.title}`}><ArrowRight/></Link></div></article>)}</div></>}
  </div></section></SiteShell>;
}
