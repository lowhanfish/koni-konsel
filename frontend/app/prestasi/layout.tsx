import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prestasi",
  description:
    "Catatan prestasi, perolehan medali, dan capaian membanggakan para atlet dan kontingen Kabupaten Konawe Selatan.",
  openGraph: {
    title: "Prestasi | KONI Kabupaten Konawe Selatan",
    description:
      "Catatan prestasi, perolehan medali, dan capaian membanggakan para atlet dan kontingen Kabupaten Konawe Selatan.",
    url: "/prestasi",
    images: [{ url: "/assets/logo-koni.png" }],
  },
};

export default function PrestasiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
