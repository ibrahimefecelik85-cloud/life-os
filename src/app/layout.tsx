// Tüm sayfaların ortak iskeleti: yazı tipi, koyu tema ve alt sekme çubuğu.
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"], // latin-ext: ç, ğ, ı, ş gibi Türkçe harfler
});

export const metadata: Metadata = {
  title: "Life OS",
  description: "Dersler, görevler, antrenman ve bütçe tek yerde",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  viewportFit: "cover", // iPhone çentiği için tam ekran
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        <main className="mx-auto w-full max-w-2xl px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-28">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
