"use client";

import { Bike, CircleDot, Dumbbell, Goal, Medal, ShieldCheck, Target, Trophy, Volleyball, Waves, Zap } from "lucide-react";
import Link from "next/link";
import { usePublicContent } from "@/hooks/use-public-content";
import { PageHero, SiteShell } from "../components/site-chrome";

const icons = [Zap, Waves, Goal, Volleyball, Target, Dumbbell, ShieldCheck, Medal, Bike, CircleDot, Trophy];

export default function CaborPage() {
  const branches = usePublicContent({ kind: "SPORT_BRANCH", pageSize: 100 });
  return <SiteShell><PageHero eyebrow="CABANG OLAHRAGA" title="Temukan" accent="Cabormu" description="Kenali cabang olahraga di bawah pembinaan KONI Kabupaten Konawe Selatan dan temukan ruang terbaik untuk mengembangkan potensimu."/><section className="inner-section"><div className="container"><div className="inner-title-row"><div><span className="mini-label">{branches.data?.meta.total ?? 0} CABANG OLAHRAGA</span><h2>Satu Semangat,<br />Beragam Arena</h2></div><p>Setiap cabang dikelola bersama pengurus dan pelatih yang berkomitmen pada pembinaan atlet berkelanjutan.</p></div>
    {branches.isPending && <p className="empty-state">Memuat cabang olahraga…</p>}{branches.isError && <p className="empty-state">Cabang olahraga belum dapat dimuat.</p>}{branches.data?.data.length === 0 && <p className="empty-state">Belum ada cabang olahraga yang dipublikasikan.</p>}
    <div className="branch-grid">{branches.data?.data.map((branch,index)=>{const Icon=icons[index%icons.length];return <article key={branch.id}><span className={`branch-icon sport-${index%5}`}><Icon/></span><div><h3>{branch.title}</h3><p>{branch.category || "Cabang olahraga"}</p><small>{branch.summary || "Pembinaan KONI Konawe Selatan"}</small></div><Link href="/kontak" aria-label={`Informasi ${branch.title}`}>→</Link></article>;})}</div></div></section><section className="inner-cta"><div className="container"><Medal/><div><h2>Punya bakat dan semangat berprestasi?</h2><p>Hubungi kami untuk informasi seleksi atlet dan jadwal latihan cabang olahraga.</p></div><Link className="button button-gold" href="/kontak">Daftar Minat</Link></div></section></SiteShell>;
}
