// vite.config.ts
import { defineConfig } from "vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  plugins: [
    vanillaExtractPlugin(), // сначала VE
    react(),
  ],
  css: { devSourcemap: true },
  build: { outDir: "dist" },
});
