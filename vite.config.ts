import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false, // Disable error overlay to prevent HMR connection issues
      clientPort: 8080,
    },
  },
  build: {
    outDir: "dist/spa",
    // Performance optimizations
    target: "es2020",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            if (id.includes("framer-motion")) {
              return "vendor-animation";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("react-hook-form") || id.includes("zod")) {
              return "vendor-forms";
            }
            // All other vendor dependencies
            return "vendor-misc";
          }

          // Split pages into separate chunks
          if (id.includes("/pages/")) {
            const pageName = id.split("/pages/")[1].split(".")[0];
            return `page-${pageName.toLowerCase()}`;
          }

          // Components chunk
          if (id.includes("/components/")) {
            return "components";
          }

          // Utilities chunk
          if (id.includes("/lib/") || id.includes("/services/")) {
            return "utils";
          }
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                .replace(/\.\w+$/, "")
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const extType = info[info.length - 1];
          if (/\.(css|scss|sass|less|styl)$/.test(extType)) {
            return "css/[name]-[hash][extname]";
          }
          if (/png|jpe?g|gif|svg|webp|avif|ico/i.test(extType)) {
            return "images/[name]-[hash][extname]";
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return "fonts/[name]-[hash][extname]";
          }
          return "[name]-[hash][extname]";
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // If using SCSS
      },
    },
  },
  // Enable gzip compression and other optimizations
  preview: {
    port: 8080,
    host: "::",
  },
});