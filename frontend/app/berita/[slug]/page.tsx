import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PageHero, SiteShell } from "../../components/site-chrome";
import { RichTextContent } from "../../components/rich-text-content";
import { ContentSource } from "../../components/content-source";
import { getContentImage } from "@/lib/content";
import { excerptFromRichText } from "@/lib/rich-text";
import { SocialShare } from "../../components/social-share";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.contentItem.findFirst({
    where: { kind: "NEWS", slug, status: { in: ["PUBLISHED", "ACTIVE"] } },
  });
  if (!post) {
    return { title: "Berita Tidak Ditemukan" };
  }

  const image = getContentImage(post.metadata);
  const description = excerptFromRichText(post.summary, 160) || "Informasi berita terbaru seputar olahraga dari KONI Kabupaten Konawe Selatan.";
  const imageUrl = image?.imageUrl || "/assets/logo-koni.png";

  return {
    title: post.title,
    description,
    keywords: [
      post.title,
      post.category || "Berita",
      "KONI Konawe Selatan",
      "Olahraga Konawe Selatan",
    ],
    openGraph: {
      type: "article",
      locale: "id_ID",
      url: `/berita/${post.slug}`,
      siteName: "KONI Kabupaten Konawe Selatan",
      title: post.title,
      description,
      publishedTime: post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      section: post.category || "Berita",
      authors: ["KONI Konawe Selatan"],
      images: [
        {
          url: imageUrl,
          alt: image?.imageAlt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.contentItem.findFirst({ where: { kind: "NEWS", slug, status: { in: ["PUBLISHED", "ACTIVE"] } } });
  if (!post) notFound();
  await prisma.contentItem.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
  const image = getContentImage(post.metadata);
  return <SiteShell><PageHero eyebrow={post.category || "BERITA KONI"} title="Berita" accent="KONI" description={post.title} /><article className="inner-section"><div className="container news-detail"><div className="detail-meta"><small><CalendarDays /> {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(post.publishedAt ?? post.updatedAt)}</small><SocialShare title={post.title} /></div><h1>{post.title}</h1>{image && <figure className="news-detail-image"><div style={{ backgroundImage: `url("${image.imageUrl}")` }} role="img" aria-label={image.imageAlt}/>{image.imageCredit && <figcaption>{image.imageCredit}</figcaption>}</figure>}<RichTextContent content={post.summary}/><ContentSource metadata={post.metadata}/></div></article></SiteShell>;
}
