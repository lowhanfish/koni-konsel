const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

export function plainTextFromRichText(value: string | null | undefined) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>|<\/li>|<\/h[1-6]>|<\/blockquote>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => entities[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

export function richTextToHtml(value: string | null | undefined) {
  if (!value) return "<p>Informasi selengkapnya akan segera diperbarui.</p>";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  const escaped = value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  return `<p>${escaped.replaceAll("\n", "<br>")}</p>`;
}
