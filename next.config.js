/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://192.168.1.116:3000'],
  images: {
    domains: [
      'localhost',              // For local development
      'localhost:2056',         // Your API server
      'i.ibb.co',               // ImgBB hosting
      'ui-avatars.com'
      // Add other domains you use for images here
    ],
    // Alternatively, use remotePatterns for more control:
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '2056',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:2056/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig