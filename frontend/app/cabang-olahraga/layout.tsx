import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cabang Olahraga",
  description:
    "Daftar cabang olahraga resmi di bawah naungan KONI Kabupaten Konawe Selatan beserta informasi pembinaan atlet dan pengurus.",
  openGraph: {
    title: "Cabang Olahraga | KONI Kabupaten Konawe Selatan",
    description:
      "Daftar cabang olahraga resmi di bawah naungan KONI Kabupaten Konawe Selatan beserta informasi pembinaan atlet dan pengurus.",
    url: "/cabang-olahraga",
    images: [{ url: "/assets/logo-koni.png" }],
  },
};

export default function SportBranchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
