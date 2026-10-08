import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Program",
  description:
    "Rangkaian program kerja strategis KONI Kabupaten Konawe Selatan untuk pembinaan prestasi atlet dan kemajuan olahraga daerah.",
  openGraph: {
    title: "Program | KONI Kabupaten Konawe Selatan",
    description:
      "Rangkaian program kerja strategis KONI Kabupaten Konawe Selatan untuk pembinaan prestasi atlet dan kemajuan olahraga daerah.",
    url: "/program",
    images: [{ url: "/assets/logo-koni.png" }],
  },
};

export default function ProgramLayout({ children }: { children: React.ReactNode }) {
  return children;
}
