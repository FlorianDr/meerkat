import { defineConfig } from "npm:vite@^5.2.10";
import react from "npm:@vitejs/plugin-react@^4.2.1";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
