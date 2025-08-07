/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vite'

const fileName = {
  es: `bolt.js`,
  iife: `bolt.iife.js`,
}

const formats = Object.keys(fileName) as Array<keyof typeof fileName>

export default defineConfig({
  base: './',
  envPrefix: 'BOLT_',
  build: {
    outDir: './build/dist',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BoltSDK',
      formats,
      fileName: format => fileName[format],
    },
  },
  server: {
    open: true, // Automatically open browser
    port: 3005, // Specify port
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    watch: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@@': path.resolve(__dirname),
    },
  },
})
