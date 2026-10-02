"use client";

import { ArrowRight, Bell, CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHero, SiteShell } from "../components/site-chrome";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePublicContent } from "@/hooks/use-public-content";
import { excerptFromRichText } from "@/lib/rich-text";

function formatDate(value: string | null, fallback: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value ?? fallback));
}

export default function PengumumanPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const announcements = usePublicContent({ kind: "ANNOUNCEMENT", q: debouncedQuery, pageSize: 30 });
  const items = announcements.data?.data ?? [];

  return <SiteShell>
    <PageHero eyebrow="INFORMASI RESMI" title="Pengumuman" accent="KONI" description="Pemberitahuan resmi, agenda, jadwal, dan informasi penting dari KONI Kabupaten Konawe Selatan." />
    <section className="inner-section announcement-section"><div className="container">
      <div className="news-toolbar"><div><span className="mini-label">PUSAT INFORMASI</span><h2>Pengumuman Terbaru</h2></div><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari pengumuman" placeholder="Cari pengumuman..." /></label></div>
      {announcements.isPending && <p className="empty-state">Memuat pengumuman…</p>}
      {announcements.isError && <p className="empty-state">Pengumuman belum dapat dimuat. Silakan coba kembali.</p>}
      {!announcements.isPending && !announcements.isError && items.length === 0 && <p className="empty-state">{query ? `Tidak ada pengumuman yang cocok dengan pencarian “${query}”.` : "Belum ada pengumuman yang diterbitkan."}</p>}
      <div className="announcement-list">{items.map((item) => <article key={item.id}>
        <div className="announcement-icon"><Bell aria-hidden="true" /></div>
        <div className="announcement-copy"><div><span className="news-tag">{item.category || "PENGUMUMAN"}</span><small><CalendarDays aria-hidden="true" /> {formatDate(item.publishedAt, item.updatedAt)}</small></div><h3>{item.title}</h3><p>{excerptFromRichText(item.summary, 230) || "Informasi resmi KONI Kabupaten Konawe Selatan."}</p></div>
        <Link href={`/pengumuman/${item.slug}`} aria-label={`Baca pengumuman ${item.title}`}>Baca detail <ArrowRight aria-hidden="true" /></Link>
      </article>)}</div>
    </div></section>
  </SiteShell>;
}
