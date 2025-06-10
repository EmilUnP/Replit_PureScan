const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const fs = require('fs')
const path = require('path')

// Enhanced next.config.js for bundle analysis
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add bundle analyzer in production
    if (!dev && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html',
          generateStatsFile: true,
          statsFilename: 'bundle-stats.json',
        })
      )
    }

    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
          chunks: 'all',
        },
        supabase: {
          test: /[\\/]node_modules[\\/]@supabase[\\/]/,
          name: 'supabase',
          priority: 15,
          chunks: 'all',
        },
        tanstack: {
          test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
          name: 'tanstack',
          priority: 15,
          chunks: 'all',
        },
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix',
          priority: 15,
          chunks: 'all',
        },
      },
    }

    return config
  },
}

// Function to analyze package.json for unused dependencies
function analyzeUnusedDependencies() {
  console.log('🔍 Analyzing package.json for potential optimizations...')
  
  const packagePath = path.join(process.cwd(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  const dependencies = Object.keys(pkg.dependencies || {})
  const devDependencies = Object.keys(pkg.devDependencies || {})
  
  console.log(`📦 Total dependencies: ${dependencies.length}`)
  console.log(`🛠️  Dev dependencies: ${devDependencies.length}`)
  
  // Check for duplicate functionality
  const duplicateChecks = [
    {
      category: 'State Management',
      packages: ['redux', 'zustand', 'jotai', 'recoil'],
      found: dependencies.filter(dep => ['redux', 'zustand', 'jotai', 'recoil'].includes(dep))
    },
    {
      category: 'Styling',
      packages: ['styled-components', 'emotion', 'tailwindcss'],
      found: dependencies.filter(dep => dep.includes('styled') || dep.includes('emotion') || dep === 'tailwindcss')
    },
    {
      category: 'HTTP Clients',
      packages: ['axios', 'fetch', 'got', 'node-fetch'],
      found: dependencies.filter(dep => ['axios', 'got', 'node-fetch'].includes(dep))
    },
    {
      category: 'Date Libraries',
      packages: ['moment', 'dayjs', 'date-fns'],
      found: dependencies.filter(dep => ['moment', 'dayjs', 'date-fns'].includes(dep))
    }
  ]
  
  duplicateChecks.forEach(check => {
    if (check.found.length > 1) {
      console.log(`⚠️  Multiple ${check.category} libraries found: ${check.found.join(', ')}`)
    }
  })
  
  return { dependencies, devDependencies }
}

// Function to check for large packages
function checkLargePackages() {
  console.log('\n📏 Checking for potentially large packages...')
  
  const potentiallyLargePackages = [
    'moment',
    'lodash',
    '@google/generative-ai',
    'framer-motion',
    'react-hook-form'
  ]
  
  const packagePath = path.join(process.cwd(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const dependencies = Object.keys(pkg.dependencies || {})
  
  const foundLargePackages = dependencies.filter(dep => 
    potentiallyLargePackages.some(large => dep.includes(large))
  )
  
  if (foundLargePackages.length > 0) {
    console.log('🚨 Large packages found:')
    foundLargePackages.forEach(pkg => {
      console.log(`   - ${pkg}`)
    })
    
    console.log('\n💡 Optimization suggestions:')
    foundLargePackages.forEach(pkg => {
      if (pkg.includes('moment')) {
        console.log('   - Consider replacing moment with date-fns (already installed) for smaller bundle size')
      }
      if (pkg.includes('lodash')) {
        console.log('   - Use lodash-es or individual lodash functions to enable tree shaking')
      }
      if (pkg.includes('framer-motion')) {
        console.log('   - Consider lazy loading framer-motion animations')
      }
    })
  }
}

// Main analysis function
function runAnalysis() {
  console.log('🚀 Starting bundle analysis...\n')
  
  analyzeUnusedDependencies()
  checkLargePackages()
  
  console.log('\n✅ Analysis complete!')
  console.log('\n📊 To generate detailed bundle report, run:')
  console.log('   npm run build')
  console.log('   Open .next/static/bundle-report.html in your browser')
}

// Export for use in next.config.js
module.exports = {
  nextConfig,
  runAnalysis
}

// Run analysis if called directly
if (require.main === module) {
  runAnalysis()
} 