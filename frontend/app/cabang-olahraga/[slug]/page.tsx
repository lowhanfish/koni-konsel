import { ArrowLeft, Medal } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PageHero, SiteShell } from "../../components/site-chrome";
import { RichTextContent } from "../../components/rich-text-content";
import { ContentSource } from "../../components/content-source";

export const dynamic = "force-dynamic";

export default async function SportBranchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const branch = await prisma.contentItem.findFirst({
    where: { kind: "SPORT_BRANCH", slug, status: { in: ["PUBLISHED", "ACTIVE"] } },
  });

  if (!branch) notFound();

  await prisma.contentItem.update({ where: { id: branch.id }, data: { viewCount: { increment: 1 } } });

  return <SiteShell><PageHero eyebrow={branch.category || "CABANG OLAHRAGA"} title="Cabang" accent="Olahraga" description={branch.title}/><section className="inner-section"><div className="container news-detail"><small><Medal/> Di bawah pembinaan KONI Kabupaten Konawe Selatan</small><h1>{branch.title}</h1><RichTextContent content={branch.summary}/><ContentSource metadata={branch.metadata}/><Link className="button" href="/cabang-olahraga"><ArrowLeft size={17}/> Lihat cabang lainnya</Link></div></section></SiteShell>;
}
