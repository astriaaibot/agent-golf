/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AGENT_GOLF_API: process.env.AGENT_GOLF_API || 'http://localhost:3000',
  },
  // Fix for Vercel deployment
  output: 'standalone',
  // Ensure proper API routing
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.AGENT_GOLF_API || 'http://localhost:3000'}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig