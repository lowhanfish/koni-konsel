import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(value: string | null | undefined) {
  if (value == null) return value;
  return sanitizeHtml(value, {
    allowedTags: ["p", "h2", "h3", "strong", "em", "s", "ul", "ol", "li", "blockquote", "a", "br", "hr", "code", "pre"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tagName, attributes) => ({ tagName: "a", attribs: { ...attributes, target: "_blank", rel: "noopener noreferrer" } }),
    },
  }).trim();
}
