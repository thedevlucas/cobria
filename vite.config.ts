import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ensures it binds to all network interfaces
    port: 5173, // Standard Vite port
    strictPort: false, // Allow fallback to another port if busy
  },
});
