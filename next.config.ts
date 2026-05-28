import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/tiktok-developers-site-verification.txt/",
        destination: "/tiktok-developers-site-verification.txt",
      },
    ];
  },
};

export default nextConfig;
