import { defineConfig } from "npm:vite@^5.2.10";
import react from "npm:@vitejs/plugin-react@^4.2.1";
import { nodePolyfills } from "npm:vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [react(), nodePolyfills()],
  server: {
    proxy: {
      "/api": "http://0.0.0.0:8000",
    },
  },
});
