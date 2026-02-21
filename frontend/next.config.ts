import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress response bodies for smaller payloads
  compress: true,
  // Remove x-powered-by header for security
  poweredByHeader: false,
  // Optimize standalone build for server deployments
  output: "standalone",
  // Image optimization (even if no images currently, shows configuration intent)
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  }
};

export default nextConfig;
