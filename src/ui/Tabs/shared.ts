import ByArtist from '../Forms/ByArtist.svelte';
import ByLink from '../Forms/ByLink.svelte';

export const createClassNames = (
	...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(' ');

export const tabMenuItems = ['By Link', 'By Artist'] as const;

export const tabs = [
	{ name: 'By Link', content: ByLink },
	{ name: 'By Artist', content: ByArtist }
];
