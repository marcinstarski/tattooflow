/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@inkflow/shared"],
  images: {
    remotePatterns: []
  }
};

module.exports = nextConfig;
