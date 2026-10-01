"use client";

import { ArrowRight, CalendarDays, Dumbbell, HeartPulse, Medal, School, Target, Users } from "lucide-react";
import Link from "next/link";
import { usePublicContent } from "@/hooks/use-public-content";
import { PageHero, SiteShell } from "../components/site-chrome";

const icons = [Dumbbell, School, Medal, HeartPulse, Users];

export default function ProgramPage() {
  const programs = usePublicContent({ kind: "PROGRAM", pageSize: 24 });
  return <SiteShell><PageHero eyebrow="PROGRAM PEMBINAAN" title="Program" accent="Unggulan" description="Rangkaian program strategis yang menghubungkan pencarian bakat, pembinaan atlet, penguatan pelatih, kompetisi, dan partisipasi masyarakat." />
    <section className="inner-section"><div className="container"><div className="inner-title-row"><div><span className="mini-label">PROGRAM AKTIF</span><h2>Program yang Terukur,<br />Dampak yang Nyata</h2></div><p>Setiap program dirancang dengan sasaran, periode, dan indikator keberhasilan yang jelas agar pembinaan berlangsung konsisten.</p></div>
      {programs.isPending && <p className="empty-state">Memuat program…</p>}{programs.isError && <p className="empty-state">Program belum dapat dimuat.</p>}{programs.data?.data.length === 0 && <p className="empty-state">Belum ada program yang dipublikasikan.</p>}
      <div className="program-detail-list">{programs.data?.data.map((program, index) => { const Icon = icons[index % icons.length]; return <article key={program.id}><div className="program-detail-image" style={{backgroundPosition:`${18+index*18}% center`}}><span>{String(index+1).padStart(2,"0")}</span></div><div className="program-detail-copy"><Icon/><div><small><CalendarDays/> {program.category || "Program KONI"}</small><h3>{program.title}</h3><p>{program.summary || "Informasi program akan segera diperbarui."}</p><Link href={`/program/${program.slug}`}>Lihat detail program <ArrowRight size={16}/></Link></div></div></article>; })}</div>
    </div></section><section className="inner-cta"><div className="container"><Target/><div><h2>Ingin berkolaborasi dalam program pembinaan?</h2><p>Kami membuka ruang kemitraan untuk sekolah, klub, komunitas, dan dunia usaha.</p></div><Link className="button button-gold" href="/kontak">Hubungi Tim Program <ArrowRight size={17}/></Link></div></section></SiteShell>;
}
