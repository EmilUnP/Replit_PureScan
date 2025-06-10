/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance optimizations
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
    // Optimize bundle size
    optimizeCss: true,
  },
  
  // Compression
  compress: true,
  
  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      // Analyze bundle (uncomment when needed)
      // const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      // config.plugins.push(new BundleAnalyzerPlugin({
      //   analyzerMode: 'static',
      //   openAnalyzer: false,
      // }));
    }

    // Optimize imports
    config.resolve.alias = {
      ...config.resolve.alias,
      // Reduce bundle size by aliasing React DOM for server-side rendering
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    };

    return config;
  },

  // Static optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Enable SWC minification
  swcMinify: true,
  
  // React optimization
  reactStrictMode: true,
  
  // Temporarily disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Generate standalone build for smaller Docker images
  output: 'standalone',

  // Security and caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Cache static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 