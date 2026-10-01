import { ArrowRight, CalendarDays, Target } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PageHero, SiteShell } from "../../components/site-chrome";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await prisma.contentItem.findFirst({
    where: { kind: "PROGRAM", slug, status: { in: ["PUBLISHED", "ACTIVE"] } },
  });

  if (!program) notFound();

  await prisma.contentItem.update({ where: { id: program.id }, data: { viewCount: { increment: 1 } } });

  return <SiteShell><PageHero eyebrow={program.category || "PROGRAM KONI"} title="Program" accent="Unggulan" description={program.title}/><section className="inner-section"><div className="container news-detail"><small><CalendarDays/> Program aktif KONI Kabupaten Konawe Selatan</small><h1>{program.title}</h1><p>{program.summary || "Informasi sasaran, jadwal, dan pelaksanaan program ini akan segera diperbarui."}</p><Link className="button" href="/kontak">Hubungi tim program <ArrowRight size={17}/></Link></div></section><section className="inner-cta"><div className="container"><Target/><div><h2>Ingin berpartisipasi dalam program ini?</h2><p>Tim KONI siap memberikan informasi pendaftaran, kemitraan, dan jadwal kegiatan.</p></div><Link className="button button-gold" href="/kontak">Hubungi Kami</Link></div></section></SiteShell>;
}
