/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Allows images from your Supabase storage
      },
    ],
  },
  // This is the corrected format for enabling server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Optional: Increase body size limit if needed
    },
  },
}

module.exports = nextConfig