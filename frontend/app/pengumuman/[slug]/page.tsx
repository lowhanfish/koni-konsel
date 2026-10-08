import type { Metadata } from "next";
import { CalendarDays, Download, FileText, Paperclip } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PageHero, SiteShell } from "../../components/site-chrome";
import { RichTextContent } from "../../components/rich-text-content";
import { SocialShare } from "../../components/social-share";
import { getContentAttachment } from "@/lib/content";
import { excerptFromRichText } from "@/lib/rich-text";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const announcement = await prisma.contentItem.findFirst({
    where: { kind: "ANNOUNCEMENT", slug, status: { in: ["PUBLISHED", "ACTIVE"] } },
  });
  if (!announcement) {
    return { title: "Pengumuman Tidak Ditemukan" };
  }

  const description = excerptFromRichText(announcement.summary, 160) || "Pemberitahuan dan pengumuman resmi dari KONI Kabupaten Konawe Selatan.";
  const imageUrl = "/assets/logo-koni.png";

  return {
    title: announcement.title,
    description,
    keywords: [
      announcement.title,
      announcement.category || "Pengumuman",
      "KONI Konawe Selatan",
      "Pengumuman KONI",
    ],
    openGraph: {
      type: "article",
      locale: "id_ID",
      url: `/pengumuman/${announcement.slug}`,
      siteName: "KONI Kabupaten Konawe Selatan",
      title: announcement.title,
      description,
      publishedTime: announcement.publishedAt?.toISOString() ?? announcement.createdAt.toISOString(),
      modifiedTime: announcement.updatedAt.toISOString(),
      section: announcement.category || "Pengumuman",
      authors: ["KONI Konawe Selatan"],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: announcement.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: announcement.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = await prisma.contentItem.findFirst({ where: { kind: "ANNOUNCEMENT", slug, status: { in: ["PUBLISHED", "ACTIVE"] } } });
  if (!announcement) notFound();
  await prisma.contentItem.update({ where: { id: announcement.id }, data: { viewCount: { increment: 1 } } });
  const attachment = getContentAttachment(announcement.metadata);

  return <SiteShell><PageHero eyebrow={announcement.category || "PENGUMUMAN RESMI"} title="Pengumuman" accent="KONI" description={announcement.title} /><article className="inner-section"><div className="container news-detail announcement-detail"><div className="detail-meta"><small><CalendarDays /> {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(announcement.publishedAt ?? announcement.updatedAt)}</small><SocialShare title={announcement.title} /></div><h1>{announcement.title}</h1><RichTextContent content={announcement.summary} />{attachment && <aside className="announcement-attachment"><FileText aria-hidden="true" /><div><span><Paperclip aria-hidden="true" /> Lampiran pengumuman</span><strong>{attachment.attachmentName}</strong></div><a href={`${attachment.attachmentUrl}?download=1`}><Download aria-hidden="true" /> Unduh lampiran</a></aside>}</div></article></SiteShell>;
}
