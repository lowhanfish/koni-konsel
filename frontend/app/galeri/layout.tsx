import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeri",
  description:
    "Dokumentasi foto dan album kegiatan olahraga, kejuaraan, serta agenda KONI Kabupaten Konawe Selatan.",
  openGraph: {
    title: "Galeri | KONI Kabupaten Konawe Selatan",
    description:
      "Dokumentasi foto dan album kegiatan olahraga, kejuaraan, serta agenda KONI Kabupaten Konawe Selatan.",
    url: "/galeri",
    images: [{ url: "/assets/logo-koni.png" }],
  },
};

export default function GaleriLayout({ children }: { children: React.ReactNode }) {
  return children;
}
