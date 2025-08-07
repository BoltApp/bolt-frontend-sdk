/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vite'
import { loadEnv } from 'vite'

const fileName = {
  es: `bolt.js`,
  iife: `bolt.iife.js`,
}

const formats = Object.keys(fileName) as Array<keyof typeof fileName>

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  const clientPort = parseInt(env.CLIENT_PORT || '3005', 10)
  const serverPort = parseInt(env.SERVER_PORT || '3001', 10)
  console.log(`Client running on port: ${clientPort}`)

  return {
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
      port: clientPort, // Use CLIENT_PORT from .env.local
      proxy: {
        '/api': {
          target: `http://localhost:${serverPort}`, // Use SERVER_PORT from .env.local
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
  }
})
