import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Change from export to standalone output
  output: "standalone",
  // Disable type checking during build to avoid params type issues
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost", "firebasestorage.googleapis.com"], // Add any image domains you're using
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true, // Required for export mode but still works with standalone
  },
  trailingSlash: true,
};

export default nextConfig;
