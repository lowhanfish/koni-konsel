import { CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PageHero, SiteShell } from "../../components/site-chrome";
import { RichTextContent } from "../../components/rich-text-content";
import { WhatsAppShare } from "../../components/whatsapp-share";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = await prisma.contentItem.findFirst({ where: { kind: "ANNOUNCEMENT", slug, status: { in: ["PUBLISHED", "ACTIVE"] } } });
  if (!announcement) notFound();
  await prisma.contentItem.update({ where: { id: announcement.id }, data: { viewCount: { increment: 1 } } });

  return <SiteShell><PageHero eyebrow={announcement.category || "PENGUMUMAN RESMI"} title="Pengumuman" accent="KONI" description={announcement.title} /><article className="inner-section"><div className="container news-detail announcement-detail"><div className="detail-meta"><small><CalendarDays /> {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(announcement.publishedAt ?? announcement.updatedAt)}</small><WhatsAppShare title={announcement.title} label="Bagikan via WhatsApp" /></div><h1>{announcement.title}</h1><RichTextContent content={announcement.summary} /></div></article></SiteShell>;
}
