// Tüm sayfaların ortak iskeleti: yazı tipi, tema ve alt sekme çubuğu.
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppMain } from "@/components/layout/AppMain";
import { BottomNav } from "@/components/layout/BottomNav";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"], // latin-ext: ç, ğ, ı, ş gibi Türkçe harfler
});

export const metadata: Metadata = {
  title: "Life OS",
  description: "Dersler, takvim, görevler ve günlük rutin tek yerde",
  // iPhone: ana ekrandan açılınca tam ekran, "Life OS" adıyla
  appleWebApp: {
    capable: true,
    title: "Life OS",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#e4dfd7",
  colorScheme: "light",
  viewportFit: "cover", // iPhone çentiği için tam ekran
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full text-ink-900">
        <AppMain>{children}</AppMain>
        <BottomNav />
        <ServiceWorker />
      </body>
    </html>
  );
}
