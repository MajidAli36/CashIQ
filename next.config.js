/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'rozcash-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 86400 }
      }
    }
  ]
})

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // next-pwa@5.6 pulls in minimatch with broken @types — suppress build-time check
    ignoreBuildErrors: true,
  },
}

module.exports = withPWA(nextConfig)
