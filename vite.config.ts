import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import UnoCss from 'unocss/vite';
import { extractorSvelte, presetUno, presetWebFonts } from 'unocss';
import presetAutoprefixer from 'unocss-preset-autoprefixer';

export default defineConfig({
  plugins: [
    UnoCss({
      theme: {
        extend: {
          // use by adding the 'animate-fade' class
          animation: {
            fade: 'fadeOut 5s ease-in-out'
          },
          keyframes: (theme: any) => ({
            fadeOut: {
              '0%': { backgroundColor: theme('colors.red.300') },
              '100%': { backgroundColor: theme('colors.transparent') }
            }
          })
        }
      },
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
