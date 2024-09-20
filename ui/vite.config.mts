import { defineConfig } from "npm:vite@^5.2.10";
import react from "npm:@vitejs/plugin-react@^4.2.1";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [react()],
  server: {
    proxy: {
      "^/api/v1/events/.*/live$": {
        target: "ws://localhost:8000",
        ws: true,
      },
      "/api": "http://localhost:8000",
    },
  },
});
