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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*'
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:4000/uploads/:path*'
      }
    ]
  }
};

export default nextConfig;
