/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    AGENT_GOLF_API: process.env.AGENT_GOLF_API || 'http://localhost:3000',
  },
}

module.exports = nextConfig