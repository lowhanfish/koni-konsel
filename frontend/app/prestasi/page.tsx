"use client";

import { Award, Medal, Star, Trophy, Users } from "lucide-react";
import { usePublicContent } from "@/hooks/use-public-content";
import { excerptFromRichText } from "@/lib/rich-text";
import { PageHero, SiteShell } from "../components/site-chrome";

export default function PrestasiPage() {
  const achievements = usePublicContent({ kind: "ACHIEVEMENT", pageSize: 100 });
  const items = achievements.data?.data ?? [];
  const categories = new Set(items.map((item) => item.category).filter(Boolean)).size;
  const currentYear = String(new Date().getFullYear());
  const thisYear = items.filter((item) => new Date(item.publishedAt ?? item.updatedAt).getFullYear() === Number(currentYear)).length;
  return <SiteShell><PageHero eyebrow="CATATAN KEBANGGAAN" title="Prestasi" accent="Daerah" description="Apresiasi untuk atlet, pelatih, dan seluruh tim yang telah mempersembahkan hasil terbaik bagi Kabupaten Konawe Selatan."/><section className="inner-section"><div className="container"><div className="medal-overview"><div><Trophy/><strong>{items.length}</strong><span>Prestasi Tercatat</span></div><div><Medal/><strong>{thisYear}</strong><span>Prestasi {currentYear}</span></div><div><Award/><strong>{categories}</strong><span>Cabang Berprestasi</span></div><div><Users/><strong>{achievements.data?.meta.total ?? 0}</strong><span>Total Publikasi</span></div></div><div className="achievement-layout"><div><span className="mini-label">JEJAK PRESTASI</span><h2>Perjalanan Menuju<br />Puncak Podium</h2><p>Setiap pencapaian adalah hasil dari latihan panjang, kerja tim, dan dukungan seluruh masyarakat Konawe Selatan.</p></div><div className="achievement-timeline">
    {achievements.isPending && <p className="empty-state">Memuat prestasi…</p>}{achievements.isError && <p className="empty-state">Prestasi belum dapat dimuat.</p>}{!achievements.isPending && !achievements.isError && items.length === 0 && <p className="empty-state">Belum ada prestasi yang dipublikasikan.</p>}
    {items.map((item)=><article key={item.id}><span>{new Date(item.publishedAt ?? item.updatedAt).getFullYear()}</span><i><Star fill="currentColor"/></i><div><small>{item.category || "Prestasi KONI"}</small><h3>{item.title}</h3><strong>{excerptFromRichText(item.summary, 190) || "Prestasi atlet Konawe Selatan"}</strong></div></article>)}</div></div></div></section></SiteShell>;
}
