"use client";

import { CalendarDays, Camera, ExternalLink, Eye, Images, Play, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePublicContent } from "@/hooks/use-public-content";
import { getGalleryMedia, type ContentItem } from "@/lib/content";
import { PageHero, SiteShell } from "../components/site-chrome";
import { RichTextContent } from "../components/rich-text-content";

function formatDate(value: string | null | undefined, fallback: string) {
  if (!value && !fallback) return "";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value ?? fallback));
}

export default function GaleriPage() {
  const [active, setActive] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const gallery = usePublicContent({ kind: "GALLERY", pageSize: 100 });

  const filters = useMemo(
    () => ["Semua", ...new Set((gallery.data?.data ?? []).map((item) => item.category).filter((value): value is string => Boolean(value)))],
    [gallery.data?.data],
  );

  const items = (gallery.data?.data ?? []).filter((item) => active === "Semua" || item.category === active);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedItem(null);
    }
    if (selectedItem) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  const selectedMedia = selectedItem ? getGalleryMedia(selectedItem.metadata) : null;

  return (
    <SiteShell>
      <PageHero
        eyebrow="DOKUMENTASI KEGIATAN"
        title="Galeri"
        accent="KONI"
        description="Rekam jejak perjuangan, kebersamaan, dan prestasi insan olahraga Kabupaten Konawe Selatan."
      />
      <section className="inner-section">
        <div className="container">
          <div className="gallery-page-head">
            <div>
              <span className="mini-label">MOMEN PILIHAN</span>
              <h2>Cerita Dalam Setiap Bingkai</h2>
            </div>
            <div className="gallery-tabs">
              {filters.map((filter) => (
                <button
                  className={active === filter ? "active" : ""}
                  onClick={() => setActive(filter)}
                  key={filter}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {gallery.isPending && <p className="empty-state">Memuat galeri…</p>}
          {gallery.isError && <p className="empty-state">Galeri belum dapat dimuat.</p>}
          {!gallery.isPending && !gallery.isError && items.length === 0 && (
            <p className="empty-state">Belum ada album pada kategori ini.</p>
          )}

          <div className="gallery-page-grid">
            {items.map((item, index) => {
              const media = getGalleryMedia(item.metadata);
              const isVideo = media?.mediaType === "VIDEO";
              const coverUrl = media?.imageUrl;
              return (
                <article
                  className={`gallery-photo gallery-interactive gallery-photo-${index % 12}`}
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedItem(item);
                    }
                  }}
                  aria-label={`Buka pratinjau ${item.title}`}
                >
                  <div
                    style={
                      coverUrl
                        ? { backgroundImage: `url("${coverUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }
                        : { backgroundPosition: `${8 + index * 8}% center` }
                    }
                  />
                  <span className={`gallery-type-pill ${isVideo ? "pill-video" : "pill-photo"}`}>
                    {isVideo ? <Play size={11} fill="currentColor" /> : <Camera size={11} />}
                    {isVideo ? "Video" : "Foto"}
                  </span>
                  <div className="gallery-caption-overlay">
                    <span className="gallery-hover-action">
                      {isVideo ? <Play size={16} fill="currentColor" /> : <Eye size={16} />}
                      {isVideo ? "Tonton Video" : "Lihat Foto"}
                    </span>
                    <h3>{item.title}</h3>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="gallery-summary">
            <Images />
            <div>
              <strong>{gallery.data?.meta.total ?? 0}</strong>
              <span>Dokumentasi kegiatan dipublikasikan dalam arsip KONI Konawe Selatan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Preview Modal */}
      {selectedItem && (
        <div
          className="gallery-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
        >
          <div className="gallery-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
            <button
              className="gallery-modal-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Tutup pratinjau"
            >
              <X size={20} />
            </button>

            <div className="gallery-modal-media-wrap">
              {selectedMedia?.mediaType === "VIDEO" && selectedMedia.youtubeId ? (
                <div className="gallery-video-container">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${selectedMedia.youtubeId}?autoplay=1&rel=0`}
                    title={selectedItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : selectedMedia?.imageUrl ? (
                <div className="gallery-photo-container">
                  <img
                    src={selectedMedia.imageUrl}
                    alt={selectedMedia.imageAlt || selectedItem.title}
                    className="gallery-photo-preview"
                  />
                </div>
              ) : (
                <div className="gallery-media-placeholder">
                  <Images size={48} />
                  <p>Pratinjau visual belum tersedia untuk dokumentasi ini</p>
                </div>
              )}
            </div>

            <div className="gallery-modal-content">
              <div className="gallery-modal-meta">
                <span className="gallery-badge-category">
                  {selectedMedia?.mediaType === "VIDEO" ? (
                    <Play size={12} fill="currentColor" />
                  ) : (
                    <Camera size={12} />
                  )}
                  {selectedItem.category || (selectedMedia?.mediaType === "VIDEO" ? "Video" : "Dokumentasi")}
                </span>
                <span className="gallery-modal-date">
                  <CalendarDays size={13} />
                  {formatDate(selectedItem.publishedAt, selectedItem.updatedAt)}
                </span>
                {selectedMedia?.videoUrl && (
                  <a
                    href={selectedMedia.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="gallery-modal-yt-btn"
                  >
                    Buka di YouTube <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <h2 id="gallery-modal-title" className="gallery-modal-title">
                {selectedItem.title}
              </h2>
              {selectedItem.summary && (
                <div className="gallery-modal-desc">
                  <RichTextContent content={selectedItem.summary} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
