// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';
import { ViteWebfontDownload } from 'vite-plugin-webfont-dl';
import { compression } from 'vite-plugin-compression2';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Base public path when served in development or production
    base: '/',

    // Directory to serve as plain static assets
    publicDir: 'public',

    // Configure plugins
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // Enable automatic runtime JSX transform
        jsxRuntime: 'automatic',
        // Add displayName to components in development
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
            mode === 'development' && 'babel-plugin-styled-components',
          ].filter(Boolean),
        },
      }),

      // PWA Plugin
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: env.VITE_APP_NAME,
          short_name: env.VITE_PWA_SHORT_NAME,
          theme_color: env.VITE_PWA_THEME_COLOR,
          background_color: env.VITE_PWA_BACKGROUND_COLOR,
          display: 'standalone',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),

      // HTML Plugin
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: env.VITE_APP_NAME,
            description: env.VITE_APP_DESCRIPTION,
          },
        },
      }),

      // Webfont Download Plugin
      ViteWebfontDownload([
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      ]),

      // Compression Plugin
      compression({
        algorithm: 'brotliCompress',
        exclude: [/\.(br)$/, /\.(gz)$/],
        deleteOriginalAssets: false,
      }),

      // Bundle Analyzer Plugin (only in build)
      mode === 'analyze' &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),

      // Split Vendor Chunk Plugin
      splitVendorChunkPlugin(),
    ],

    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },

    // Server configuration
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate sourcemaps
      sourcemap: mode !== 'production',
      
      // Minify configuration
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },

      // Rollup options
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mui-vendor': ['@mui/material', '@mui/icons-material'],
            'utils-vendor': ['axios', 'date-fns', 'lodash'],
          },
        },
      },

      // Asset handling
      assetsDir: 'assets',
      assetInlineLimit: 4096,
      
      // CSS handling
      cssCodeSplit: true,
      cssMinify: true,
      
      // Report compressed sizes
      reportCompressedSize: true,
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },

    // Optimization configuration
    optimizeDeps: {
      include: ['react', 'react-dom', '@mui/material'],
      exclude: ['@fsouza/prettierd'],
    },

    // Preview configuration
    preview: {
      port: 3000,
      strictPort: true,
      host: true,
    },

    // Environment variables configuration
    envPrefix: 'VITE_',
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  };
});
