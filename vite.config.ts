import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import UnoCss from 'unocss/vite';
import { extractorSvelte, presetUno, presetWebFonts } from 'unocss';

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
