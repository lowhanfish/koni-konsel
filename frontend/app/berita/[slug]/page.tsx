import { CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PageHero, SiteShell } from "../../components/site-chrome";
import { RichTextContent } from "../../components/rich-text-content";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.contentItem.findFirst({ where: { kind: "NEWS", slug, status: { in: ["PUBLISHED", "ACTIVE"] } } });
  if (!post) notFound();
  await prisma.contentItem.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
  return <SiteShell><PageHero eyebrow={post.category || "BERITA KONI"} title="Berita" accent="KONI" description={post.title} /><article className="inner-section"><div className="container news-detail"><small><CalendarDays /> {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(post.publishedAt ?? post.updatedAt)}</small><h1>{post.title}</h1><RichTextContent content={post.summary}/></div></article></SiteShell>;
}
