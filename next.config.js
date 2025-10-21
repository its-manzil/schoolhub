/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',              // For local development
      'localhost:2056',         // Your API server
      'i.ibb.co',               // ImgBB hosting
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
  // Other Next.js config options...
}

module.exports = nextConfig