import type { SvelteComponent } from 'svelte';
import ByArtist from '../forms/ByArtist.svelte';
import ByLink from '../forms/ByLink.svelte';

export const createClassNames = (
	...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(' ');

export const tabs = [
	{ name: 'By Link', content: ByLink },
	{ name: 'By Search', content: ByArtist }
];
