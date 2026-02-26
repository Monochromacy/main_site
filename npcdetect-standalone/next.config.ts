import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages deployment
  experimental: {
    // Edge runtime support
  },
};

export default nextConfig;
