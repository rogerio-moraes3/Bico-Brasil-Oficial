import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
// Cache bust: v12

// AUMENTE ESTE NÚMERO sempre que quiser forçar rebuild total
const CACHE_VERSION = 8;

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ['react', 'react-dom'],
  },

  // garante que o Vite NUNCA reutilize cache antigo
  cacheDir: `.vite_cache_v${CACHE_VERSION}`,

  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
      clientPort: 443, // necessário no Lovable Cloud
    },
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    watch: {
      usePolling: true,
      interval: 100
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "next-themes",
    ],
    force: true,
  },

  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-v${CACHE_VERSION}-[hash].js`,
        chunkFileNames: `assets/[name]-v${CACHE_VERSION}-[hash].js`,
        assetFileNames: `assets/[name]-v${CACHE_VERSION}-[hash].[ext]`,
      },
    },
  },

  experimental: {
    hmrPartialAccept: false,
  },
}));
