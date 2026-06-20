import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // AlphaTab is only imported lazily (on PDF download), so Vite would otherwise
  // discover and re-optimize it on first click, causing a 504 on the dynamic
  // import. Pre-bundling it at server start avoids that.
  optimizeDeps: {
    include: ['@coderline/alphatab']
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
