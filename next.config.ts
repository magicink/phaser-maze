import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  experimental: {
    reactCompiler: true
  }
}

export default nextConfig
