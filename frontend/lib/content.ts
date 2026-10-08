export const contentKinds = ["NEWS", "ANNOUNCEMENT", "PROGRAM", "SPORT_BRANCH", "GALLERY", "ACHIEVEMENT"] as const;
export const contentStatuses = ["DRAFT", "PUBLISHED", "ACTIVE", "SCHEDULED", "ARCHIVED"] as const;

export type ContentKind = (typeof contentKinds)[number];
export type ContentStatus = (typeof contentStatuses)[number];

export type ContentItem = {
  id: string;
  kind: ContentKind;
  title: string;
  slug: string;
  category: string | null;
  summary: string | null;
  status: ContentStatus;
  metadata: unknown;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ContentListResponse = {
  data: ContentItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
    statusCounts: Partial<Record<ContentStatus, number>>;
  };
};

export function getContentSource(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const sourceUrl = "sourceUrl" in metadata ? metadata.sourceUrl : undefined;
  const sourceTitle = "sourceTitle" in metadata ? metadata.sourceTitle : undefined;
  if (typeof sourceUrl !== "string" || typeof sourceTitle !== "string") return null;
  return { sourceUrl, sourceTitle };
}

export function getContentImage(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const imageUrl = "imageUrl" in metadata ? metadata.imageUrl : undefined;
  const imageFileId = "imageFileId" in metadata ? metadata.imageFileId : undefined;
  const imageAlt = "imageAlt" in metadata ? metadata.imageAlt : undefined;
  const imageCredit = "imageCredit" in metadata ? metadata.imageCredit : undefined;
  if (typeof imageUrl !== "string" || !imageUrl) return null;
  return {
    imageUrl,
    imageFileId: typeof imageFileId === "string" ? imageFileId : null,
    imageAlt: typeof imageAlt === "string" ? imageAlt : "Dokumentasi berita",
    imageCredit: typeof imageCredit === "string" ? imageCredit : null,
  };
}

export function getContentAttachment(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const attachmentUrl = "attachmentUrl" in metadata ? metadata.attachmentUrl : undefined;
  const attachmentFileId = "attachmentFileId" in metadata ? metadata.attachmentFileId : undefined;
  const attachmentName = "attachmentName" in metadata ? metadata.attachmentName : undefined;
  const attachmentMimeType = "attachmentMimeType" in metadata ? metadata.attachmentMimeType : undefined;
  const attachmentSize = "attachmentSize" in metadata ? metadata.attachmentSize : undefined;
  if (typeof attachmentUrl !== "string" || !attachmentUrl || typeof attachmentName !== "string") return null;
  return {
    attachmentUrl,
    attachmentFileId: typeof attachmentFileId === "string" ? attachmentFileId : null,
    attachmentName,
    attachmentMimeType: typeof attachmentMimeType === "string" ? attachmentMimeType : "application/octet-stream",
    attachmentSize: typeof attachmentSize === "number" ? attachmentSize : null,
  };
}

export const sectionKindMap: Record<string, ContentKind | undefined> = {
  berita: "NEWS",
  pengumuman: "ANNOUNCEMENT",
  program: "PROGRAM",
  "cabang-olahraga": "SPORT_BRANCH",
  galeri: "GALLERY",
  prestasi: "ACHIEVEMENT",
};

export const statusLabels: Record<ContentStatus, string> = {
  DRAFT: "Draf",
  PUBLISHED: "Terbit",
  ACTIVE: "Aktif",
  SCHEDULED: "Terjadwal",
  ARCHIVED: "Diarsipkan",
};
