/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Allow localhost for dev, and any .vercel.app domain for production
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },
};

module.exports = nextConfig;
