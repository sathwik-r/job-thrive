import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
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
    rollupOptions: {
      external: [
        "dotenv",
        "@babel/preset-typescript",
        "lightningcss",
        /\.node$/,
        /node:*/,
        "path",
        "fs",
        "crypto",
        "http",
        "https",
        "stream",
        "zlib",
        "util",
        "url",
        "net",
        "tls",
        "os",
        "buffer",
        "querystring",
        "events",
        "assert",
        "child_process",
        "constants",
        "module",
        "process",
        "string_decoder",
        "timers",
        "tty",
        "vm"
      ],
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
