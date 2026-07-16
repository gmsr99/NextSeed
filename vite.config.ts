import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // PWA mínima (FASE 3.5): instalável no ecrã principal, atualização
    // automática do service worker. Offline real fica fora de scope.
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["nexseed-icon.png", "apple-touch-icon.png"],
      manifest: {
        name: "NexSeed",
        short_name: "NexSeed",
        description: "O plano semanal de homeschooling da vossa família",
        lang: "pt-PT",
        display: "standalone",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Os PDFs geram-se no cliente e os dados vêm do Supabase — só se
        // pré-cacheia o shell da app.
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/functions\//],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["@react-pdf/renderer"],
  },
}));
