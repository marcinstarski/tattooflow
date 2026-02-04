/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@inkflow/shared"],
  images: {
    remotePatterns: []
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;
