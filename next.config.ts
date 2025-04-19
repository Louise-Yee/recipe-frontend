import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Changed from "standalone" to "export"
  distDir: "out", // Explicitly specify output directory
  images: {
    unoptimized: true,
    domains: ["localhost", "firebasestorage.googleapis.com"], // Add any image domains you're using
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  trailingSlash: true,
};

export default nextConfig;
