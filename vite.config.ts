import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // ✅ This ensures all built assets use correct relative URLs
    assetsDir: "assets",
    rollupOptions: {
      external: [
        "dotenv",
        "@babel/preset-typescript",
        "lightningcss",
        /\.node$/,
        /node:.*/,
      ],
    },
  },

  // ✅ The most important addition:
  base: "/", // Ensures assets resolve as /assets/... not file:///...

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
