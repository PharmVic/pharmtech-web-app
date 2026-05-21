import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in", 
      }
    ],
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/sign-in",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth/sign-up",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth/sign-up",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
