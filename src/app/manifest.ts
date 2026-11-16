// PWA manifesti: telefona "uygulama gibi" kurulunca adı, ikonu ve görünümü buradan gelir.
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Life OS",
    short_name: "Life OS",
    description: "Dersler, takvim, görevler, günlük rutin ve bütçe tek yerde",
    lang: "tr",
    start_url: "/",
    scope: "/",
    display: "standalone", // tarayıcı çubukları olmadan, tam ekran
    orientation: "portrait",
    background_color: "#e4dfd7",
    theme_color: "#e4dfd7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
