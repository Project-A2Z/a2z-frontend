import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration for external domains using the current Next.js format
  images: {
    remotePatterns: [
      new URL('https://res.cloudinary.com/**'),
      // Add other image domains if you have any
      // new URL('https://another-domain.com/**'),
    ],
    
    // Optional: Image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Your existing webpack configuration
  webpack(config) {
    // SVG configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });
    
    // You can add more webpack configurations here if needed
    return config;
  },
  
  // Other Next.js configurations...
  experimental: {
    // Add any experimental features you're using
  },
  
  // If you're using TypeScript
  typescript: {
    // ignoreBuildErrors: false, // Set to true only if you want to ignore TS errors during build
  },
  
  // Environment variables (if needed)
  env: {
    // Add any custom environment variables
  },
};

export default nextConfig;