/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      // Example for production if backend runs on same domain
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
