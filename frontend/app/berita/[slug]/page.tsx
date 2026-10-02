import { CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PageHero, SiteShell } from "../../components/site-chrome";
import { RichTextContent } from "../../components/rich-text-content";
import { ContentSource } from "../../components/content-source";
import { getContentImage } from "@/lib/content";
import { WhatsAppShare } from "../../components/whatsapp-share";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.contentItem.findFirst({ where: { kind: "NEWS", slug, status: { in: ["PUBLISHED", "ACTIVE"] } } });
  if (!post) notFound();
  await prisma.contentItem.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
  const image = getContentImage(post.metadata);
  return <SiteShell><PageHero eyebrow={post.category || "BERITA KONI"} title="Berita" accent="KONI" description={post.title} /><article className="inner-section"><div className="container news-detail"><div className="detail-meta"><small><CalendarDays /> {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(post.publishedAt ?? post.updatedAt)}</small><WhatsAppShare title={post.title} label="Bagikan via WhatsApp" /></div><h1>{post.title}</h1>{image && <figure className="news-detail-image"><div style={{ backgroundImage: `url("${image.imageUrl}")` }} role="img" aria-label={image.imageAlt}/>{image.imageCredit && <figcaption>{image.imageCredit}</figcaption>}</figure>}<RichTextContent content={post.summary}/><ContentSource metadata={post.metadata}/></div></article></SiteShell>;
}
