"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Pilcrow, Quote, Redo2, RemoveFormatting, Undo2, Unlink } from "lucide-react";
import { useState } from "react";

type RichTextEditorProps = {
  name: string;
  defaultValue?: string | null;
  error?: string;
};

export function RichTextEditor({ name, defaultValue, error }: RichTextEditorProps) {
  const initialContent = defaultValue || "<p></p>";
  const [value, setValue] = useState(initialContent);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: initialContent,
    immediatelyRender: false,
    editorProps: { attributes: { class: "rich-text-editor-content" } },
    onUpdate: ({ editor: currentEditor }) => setValue(currentEditor.getHTML()),
  });

  function editLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL tautan", previous || "https://");
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim(), target: "_blank", rel: "noopener noreferrer" }).run();
  }

  const button = (label: string, action: () => void, active: boolean, Icon: typeof Bold) => (
    <button type="button" aria-label={label} title={label} className={active ? "active" : ""} onClick={action} disabled={!editor}><Icon /></button>
  );

  return <div className="rich-text-field">
    <div className="rich-text-toolbar" role="toolbar" aria-label="Format deskripsi">
      {button("Paragraf", () => editor?.chain().focus().setParagraph().run(), Boolean(editor?.isActive("paragraph")), Pilcrow)}
      {button("Judul bagian", () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), Boolean(editor?.isActive("heading", { level: 2 })), Heading2)}
      {button("Tebal", () => editor?.chain().focus().toggleBold().run(), Boolean(editor?.isActive("bold")), Bold)}
      {button("Miring", () => editor?.chain().focus().toggleItalic().run(), Boolean(editor?.isActive("italic")), Italic)}
      {button("Daftar poin", () => editor?.chain().focus().toggleBulletList().run(), Boolean(editor?.isActive("bulletList")), List)}
      {button("Daftar nomor", () => editor?.chain().focus().toggleOrderedList().run(), Boolean(editor?.isActive("orderedList")), ListOrdered)}
      {button("Kutipan", () => editor?.chain().focus().toggleBlockquote().run(), Boolean(editor?.isActive("blockquote")), Quote)}
      {button("Tambah atau ubah tautan", editLink, Boolean(editor?.isActive("link")), Link2)}
      {button("Hapus tautan", () => editor?.chain().focus().unsetLink().run(), false, Unlink)}
      {button("Hapus format", () => editor?.chain().focus().unsetAllMarks().clearNodes().run(), false, RemoveFormatting)}
      {button("Urungkan", () => editor?.chain().focus().undo().run(), false, Undo2)}
      {button("Ulangi", () => editor?.chain().focus().redo().run(), false, Redo2)}
    </div>
    <EditorContent editor={editor} />
    <input type="hidden" name={name} value={value} />
    {error && <small className="field-error">{error}</small>}
  </div>;
}
