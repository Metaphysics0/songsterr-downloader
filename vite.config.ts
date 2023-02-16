import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

import { extractorSvelte, presetIcons, presetUno } from 'unocss';
import UnoCss from 'unocss/vite';

export default defineConfig({
	plugins: [
		UnoCss({
			extractors: [extractorSvelte],
			shortcuts: [
				{ logo: 'i-logos:svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' }
			],
			presets: [
				presetUno(),
				presetIcons({
					collections: {
						custom: {
							// do not remove LF: testing trimCustomSvg on universal icon loader
							circle: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
<circle cx="60" cy="60" r="50"/>
</svg>
`
						}
					},
					extraProperties: {
						display: 'inline-block',
						'vertical-align': 'middle'
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
