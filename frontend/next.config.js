/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/posts', destination: '/blog', permanent: true },
      { source: '/posts/:slug', destination: '/blog/:slug', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
    ],
  },
}

module.exports = nextConfig
