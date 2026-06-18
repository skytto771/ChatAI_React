import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/images": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/videos": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/others": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
