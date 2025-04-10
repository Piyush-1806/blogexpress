import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Optional Cartographer plugin loader (conditionally applied)
const cartographerPlugin =
  process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
    ? await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer())
    : null;

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(cartographerPlugin ? [cartographerPlugin] : []),
  ],
  base: "/blogexpress/",
  root: path.resolve(import.meta.dirname, "client"),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "docs"),
    emptyOutDir: true,
  },
});
