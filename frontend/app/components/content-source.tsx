import { ExternalLink } from "lucide-react";
import { getContentSource } from "@/lib/content";

export function ContentSource({ metadata }: { metadata: unknown }) {
  const source = getContentSource(metadata);
  if (!source) return null;
  return <aside className="content-source"><span>Referensi</span><a href={source.sourceUrl} target="_blank" rel="noreferrer">{source.sourceTitle}<ExternalLink /></a></aside>;
}
