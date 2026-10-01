import { richTextToHtml } from "@/lib/rich-text";

export function RichTextContent({ content, className = "rich-text-content" }: { content: string | null | undefined; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: richTextToHtml(content) }} />;
}
