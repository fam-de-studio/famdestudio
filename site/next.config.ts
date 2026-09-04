import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75, 82],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [256, 384, 512, 640],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  poweredByHeader: false,
  compress: true,
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
