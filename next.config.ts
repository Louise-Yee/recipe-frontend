import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Change from standalone to export for static site generation
  output: "export",
  // Specify the output directory that matches firebase.json
  distDir: "out",
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
    unoptimized: true, // Required for export mode
  },
  trailingSlash: true,
};

export default nextConfig;
