import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "**.zekai.ai",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
