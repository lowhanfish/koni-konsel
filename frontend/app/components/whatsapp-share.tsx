"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppShare({ title, label }: { title: string; label: string }) {
  function share() {
    const text = `${title}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return <button className="whatsapp-share" type="button" onClick={share} aria-label={`${label} melalui WhatsApp`}>
    <MessageCircle aria-hidden="true" />
    {label}
  </button>;
}
