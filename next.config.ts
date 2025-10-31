import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Development indicators configuration
  devIndicators: false,
  // Or set to false to disable: devIndicators: false,
  
  // Image configuration for external domains using the current Next.js format
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Add other image domains if you have any
      // {
      //   protocol: 'https',
      //   hostname: 'another-domain.com',
      //   pathname: '/**',
      // },
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
      config.optimization.minimizer.forEach((plugin: { constructor: { name: string; }; options: { terserOptions: { compress: { drop_console: boolean; }; }; }; }) => {
        if (plugin.constructor.name === 'TerserPlugin') {
          plugin.options.terserOptions.compress.drop_console = true;
        }
      });
    }
    
    return config;
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