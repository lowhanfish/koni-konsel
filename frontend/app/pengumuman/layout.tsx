import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengumuman",
  description:
    "Pemberitahuan resmi, agenda kegiatan, pengumuman seleksi, dan informasi penting KONI Kabupaten Konawe Selatan.",
  openGraph: {
    title: "Pengumuman | KONI Kabupaten Konawe Selatan",
    description:
      "Pemberitahuan resmi, agenda kegiatan, pengumuman seleksi, dan informasi penting KONI Kabupaten Konawe Selatan.",
    url: "/pengumuman",
    images: [{ url: "/assets/logo-koni.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pengumuman | KONI Kabupaten Konawe Selatan",
    description:
      "Pemberitahuan resmi, agenda kegiatan, pengumuman seleksi, dan informasi penting KONI Kabupaten Konawe Selatan.",
    images: ["/assets/logo-koni.png"],
  },
};

export default function PengumumanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
