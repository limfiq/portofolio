/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**', // Mengizinkan semua path di bawah hostname ini
      },
    ],
  },
};

module.exports = nextConfig;
