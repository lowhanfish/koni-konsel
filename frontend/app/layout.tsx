import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KONI Kabupaten Konawe Selatan",
  description:
    "Portal resmi Komite Olahraga Nasional Indonesia Kabupaten Konawe Selatan.",
  icons: { icon: "/assets/logo-koni.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${plusJakarta.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
