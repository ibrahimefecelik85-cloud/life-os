import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
