import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'), // Adjust the path as needed
  experimental: {
    // Other experimental features if needed
  },
};

export default nextConfig;