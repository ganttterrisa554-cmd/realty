import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images1.apartments.com",
      "images1.forrent.com",
      "images.unsplash.com",
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
