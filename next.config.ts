import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
