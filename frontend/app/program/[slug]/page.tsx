import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PageHero, SiteShell } from "../../components/site-chrome";
import { RichTextContent } from "../../components/rich-text-content";
import { ContentSource } from "../../components/content-source";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await prisma.contentItem.findFirst({
    where: { kind: "PROGRAM", slug, status: { in: ["PUBLISHED", "ACTIVE"] } },
  });

  if (!program) notFound();

  await prisma.contentItem.update({ where: { id: program.id }, data: { viewCount: { increment: 1 } } });

  return <SiteShell><PageHero eyebrow={program.category || "PROGRAM KONI"} title="Program" accent="Unggulan" description={program.title}/><section className="inner-section"><div className="container news-detail"><small><CalendarDays/> Program aktif KONI Kabupaten Konawe Selatan</small><h1>{program.title}</h1><RichTextContent content={program.summary}/><ContentSource metadata={program.metadata}/><Link className="button" href="/program"><ArrowLeft size={17}/> Lihat program lainnya</Link></div></section></SiteShell>;
}
