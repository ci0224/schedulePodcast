import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 3005,
    strictPort: true,
    host: '0.0.0.0',
  },
  define: {
    'window.env': {
      OPENAI_API_KEY: JSON.stringify(process.env.OPENAI_API_KEY)
    }
  }
});
