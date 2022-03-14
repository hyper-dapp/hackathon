import plainText from 'vite-plugin-plain-text';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    plainText(/\.pl$/),
  ],
  build: {
    target: 'es2020'
  }
});
