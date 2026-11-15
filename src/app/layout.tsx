// Tüm sayfaların ortak iskeleti: yazı tipi, koyu tema ve alt sekme çubuğu.
import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { AppMain } from "@/components/layout/AppMain";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"], // latin-ext: ç, ğ, ı, ş gibi Türkçe harfler
});

// Başlıklar için tırnaklı (serif) yazı tipi
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Life OS",
  description: "Dersler, görevler, antrenman ve bütçe tek yerde",
};

export const viewport: Viewport = {
  themeColor: "#0f0c0a",
  colorScheme: "dark",
  viewportFit: "cover", // iPhone çentiği için tam ekran
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full text-ink-100">
        <AppMain>{children}</AppMain>
        <BottomNav />
      </body>
    </html>
  );
}
