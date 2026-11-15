"use client";
// Sayfa içeriğinin kabı. Bugün ekranı bilgisayarda iki sütunlu olduğu için daha geniş;
// diğer sayfalar okunaklı kalsın diye dar.
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

const WIDE_PAGES = ["/"];

export function AppMain({ children }: { children: ReactNode }) {
  const wide = WIDE_PAGES.includes(usePathname());
  return (
    <main
      className={`mx-auto w-full px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-28 ${wide ? "max-w-2xl lg:max-w-6xl" : "max-w-2xl"}`}
    >
      {children}
    </main>
  );
}
