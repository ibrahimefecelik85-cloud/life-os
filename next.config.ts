import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Service worker dosyası tarayıcıda önbelleğe alınmasın (güncellemeler hemen gelsin)
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  // Tailwind CSS'i Turbopack (Next.js'in derleyicisi) ile işle
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
