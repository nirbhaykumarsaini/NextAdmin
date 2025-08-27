// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // ✅ Allow images from external domains (optional)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // change to specific domain if needed
      },
    ],
  },

  // ✅ If you’re using API routes and need Node.js runtime
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
