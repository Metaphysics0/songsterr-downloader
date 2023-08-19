import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import UnoCss from 'unocss/vite';
import { extractorSvelte, presetUno, presetWebFonts } from 'unocss';
import presetAutoprefixer from 'unocss-preset-autoprefixer';

export default defineConfig({
  plugins: [
    UnoCss({
      extractors: [extractorSvelte],
      shortcuts: [
        {
          logo: 'i-logos:svelte-icon w-6em h-6em transform transition-800 hover:rotate-180'
        }
      ],
      presets: [
        presetUno(),
        presetAutoprefixer(),
        presetWebFonts({
          provider: 'google',
          fonts: {
            sans: 'Nunito'
          }
        })
      ]
    }),
    sveltekit()
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
