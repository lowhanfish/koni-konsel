import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koni-konsel.konaweselatankab.go.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KONI Kabupaten Konawe Selatan",
    template: "%s | KONI Kabupaten Konawe Selatan",
  },
  description:
    "Portal resmi Komite Olahraga Nasional Indonesia Kabupaten Konawe Selatan. Informasi terkini seputar pembinaan, cabang olahraga, agenda kegiatan, pengumuman, dan prestasi atlet daerah.",
  keywords: [
    "KONI",
    "Konawe Selatan",
    "KONI Konsel",
    "Olahraga Konawe Selatan",
    "Atlet Konawe Selatan",
    "Porprov Sultra",
    "Prestasi Olahraga",
    "Berita Olahraga Konawe Selatan",
  ],
  authors: [{ name: "KONI Kabupaten Konawe Selatan" }],
  creator: "KONI Kabupaten Konawe Selatan",
  publisher: "KONI Kabupaten Konawe Selatan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "KONI Kabupaten Konawe Selatan",
    title: "KONI Kabupaten Konawe Selatan",
    description:
      "Portal resmi Komite Olahraga Nasional Indonesia Kabupaten Konawe Selatan.",
    images: [
      {
        url: "/assets/logo-koni.png",
        width: 1200,
        height: 1200,
        alt: "Logo KONI Kabupaten Konawe Selatan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KONI Kabupaten Konawe Selatan",
    description:
      "Portal resmi Komite Olahraga Nasional Indonesia Kabupaten Konawe Selatan.",
    images: ["/assets/logo-koni.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/assets/logo-koni.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/assets/logo-koni.png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${plusJakarta.variable} antialiased`} data-scroll-behavior="smooth">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
