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
  
  // Your existing webpack configuration - Updated for console removal in production
  webpack(config, { dev, isServer }) {
    // SVG configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    // Remove console.log in production (client-side only)
    if (!dev && !isServer) {
      config.optimization.minimizer.forEach((plugin) => {
        if (plugin.constructor.name === 'TerserPlugin') {
          plugin.options.terserOptions.compress.drop_console = true;
        }
      });
    }
    
    // You can add more webpack configurations here if needed
    return config;
  },
  
  // Other Next.js configurations...
  experimental: {
    // Add any experimental features you're using
    logging: {
      level: 'warn', // Limit logs to warnings in development
    },
  },
  
  // If you're using TypeScript
  typescript: {
    // ignoreBuildErrors: false, // Set to true only if you want to ignore TS errors during build
  },
  
  // Environment variables (if needed)
  env: {
    // Add any custom environment variables
  },

  // Global revalidation for ISR (Incremental Static Regeneration)
  revalidate: 3600, // Revalidate every hour for better caching
};

export default nextConfig;