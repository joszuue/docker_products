import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Soporte para imágenes remotas del backend
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
    // Permitir también imágenes no optimizadas si se usa directamente URL externa
    unoptimized: true,
  },
};

export default nextConfig;
