import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Komite Olahraga Nasional Indonesia (KONI) Kabupaten Konawe Selatan melalui telepon, email, formulir, atau kunjungi kantor kami.",
  openGraph: {
    title: "Kontak | KONI Kabupaten Konawe Selatan",
    description:
      "Hubungi Komite Olahraga Nasional Indonesia (KONI) Kabupaten Konawe Selatan melalui telepon, email, formulir, atau kunjungi kantor kami.",
    url: "/kontak",
    images: [{ url: "/assets/logo-koni.png" }],
  },
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
