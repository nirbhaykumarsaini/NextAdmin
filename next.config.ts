import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Ensure Node.js runtime is used for API routes (important for Vercel, etc.)
  experimental: {
    runtime: "nodejs",
  },

  // Optional: If you’re using images from external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // or restrict to your CDN/domain
      },
    ],
  },

  // Optional: Add CORS headers for API routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // or restrict to your frontend domain
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
