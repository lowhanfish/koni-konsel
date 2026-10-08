import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita",
  description:
    "Kumpulan berita, liputan kejuaraan, dan informasi terkini seputar dunia olahraga KONI Kabupaten Konawe Selatan.",
  openGraph: {
    title: "Berita | KONI Kabupaten Konawe Selatan",
    description:
      "Kumpulan berita, liputan kejuaraan, dan informasi terkini seputar dunia olahraga KONI Kabupaten Konawe Selatan.",
    url: "/berita",
    images: [{ url: "/assets/logo-koni.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Berita | KONI Kabupaten Konawe Selatan",
    description:
      "Kumpulan berita, liputan kejuaraan, dan informasi terkini seputar dunia olahraga KONI Kabupaten Konawe Selatan.",
    images: ["/assets/logo-koni.png"],
  },
};

export default function BeritaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
