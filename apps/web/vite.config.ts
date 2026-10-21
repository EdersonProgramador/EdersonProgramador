import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: "../..",
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    proxy: {
      "/auth": { target: "http://127.0.0.1:3333", changeOrigin: true },
      "/public": { target: "http://127.0.0.1:3333", changeOrigin: true },
      "/agency": { target: "http://127.0.0.1:3333", changeOrigin: true },
      "/health": { target: "http://127.0.0.1:3333", changeOrigin: true }
    }
  }
});
