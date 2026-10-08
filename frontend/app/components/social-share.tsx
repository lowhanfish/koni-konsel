"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.07 16.29C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.69 12.05 3.69C14.25 3.69 16.31 4.55 17.87 6.11C19.42 7.67 20.28 9.73 20.28 11.93C20.27 16.48 16.59 20.15 12.05 20.15ZM16.57 14.34C16.32 14.21 15.1 13.61 14.88 13.53C14.65 13.45 14.49 13.41 14.32 13.66C14.16 13.91 13.68 14.47 13.54 14.64C13.39 14.8 13.25 14.82 13 14.7C12.75 14.57 11.96 14.31 11.02 13.48C10.29 12.83 9.8 12.02 9.65 11.78C9.51 11.53 9.64 11.39 9.76 11.27C9.88 11.16 10.02 10.97 10.16 10.81C10.3 10.65 10.35 10.53 10.44 10.36C10.53 10.19 10.49 10.05 10.42 9.93C10.36 9.8 9.87 8.6 9.67 8.1C9.47 7.62 9.27 7.68 9.12 7.68C8.98 7.67 8.81 7.67 8.65 7.67C8.48 7.67 8.21 7.73 7.98 7.98C7.76 8.23 7.12 8.82 7.12 10.04C7.12 11.25 8.01 12.42 8.13 12.59C8.25 12.75 9.87 15.26 12.35 16.33C12.94 16.58 13.4 16.74 13.76 16.85C14.36 17.04 14.9 17.02 15.34 16.95C15.82 16.88 16.83 16.34 17.04 15.75C17.25 15.17 17.25 14.67 17.18 14.57C17.12 14.46 16.82 14.46 16.57 14.34Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function SocialShare({ title }: { title: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  }

  function shareWhatsApp() {
    const text = `${title}\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function shareFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  }

  async function shareInstagram() {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or unsupported, fallback below
      }
    }
    // Fallback: Salin link ke clipboard lalu buka Instagram
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Tautan disalin! Membuka Instagram…");
      setTimeout(() => setCopied(false), 2500);
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    } catch {
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("Tautan berhasil disalin!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Gagal menyalin tautan");
    }
  }

  return (
    <div className="social-share-wrap">
      <span className="social-share-label">Bagikan:</span>
      <div className="social-share-buttons">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="social-share-btn share-wa"
          aria-label="Bagikan ke WhatsApp"
          title="Bagikan ke WhatsApp"
        >
          <WhatsAppIcon />
        </button>

        <button
          type="button"
          onClick={shareFacebook}
          className="social-share-btn share-fb"
          aria-label="Bagikan ke Facebook"
          title="Bagikan ke Facebook"
        >
          <FacebookIcon />
        </button>

        <button
          type="button"
          onClick={shareInstagram}
          className="social-share-btn share-ig"
          aria-label="Bagikan ke Instagram"
          title="Bagikan ke Instagram"
        >
          <InstagramIcon />
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className={`social-share-btn share-copy ${copied ? "copied" : ""}`}
          aria-label={copied ? "Tautan tersalin" : "Salin tautan"}
          title={copied ? "Tautan tersalin!" : "Salin tautan"}
        >
          {copied ? <Check size={16} /> : <Link2 size={16} />}
        </button>
      </div>

      {toastMessage && (
        <span className="social-share-toast" role="status">
          {toastMessage}
        </span>
      )}
    </div>
  );
}

// Backward-compatibility alias
export function WhatsAppShare({ title }: { title: string; label?: string }) {
  return <SocialShare title={title} />;
}
