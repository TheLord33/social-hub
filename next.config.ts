import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: { root: __dirname },
  async rewrites() {
    return [
      {
        source: "/tiktok-developers-site-verification.txt/",
        destination: "/tiktok-developers-site-verification.txt",
      },
    ];
  },
};

export default withPWA(nextConfig);
