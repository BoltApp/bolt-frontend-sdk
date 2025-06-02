/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";

const fileName = {
  es: `bolt-charge-sdk.js`,
  iife: `bolt-charge-sdk.iife.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
  base: "./",
  build: {
    outDir: "./build/dist",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BoltSDK",
      formats,
      fileName: format => fileName[format],
    },
  },
  server: {
    open: true, // Automatically open browser
    port: 3000, // Specify port
  },
  test: {
    watch: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@@": path.resolve(__dirname),
    },
  },
});
