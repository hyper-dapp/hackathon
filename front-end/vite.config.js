import { resolve } from "path";
import { defineConfig } from "vite";
import plainText from "vite-plugin-plain-text";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [plainText(/\.pl$/)],
  root,
  build: {
    outDir,
    target: "es2020",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
      },
    },
  },
});
