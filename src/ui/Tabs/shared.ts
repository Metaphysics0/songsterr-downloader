import BySearch from '../forms/BySearch/Form.svelte';
import ByLink from '../forms/ByLink/Form.svelte';

export const createClassNames = (
	...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(' ');

export const tabs = [
	{ name: 'By Link', content: ByLink },
	{ name: 'By Search', content: BySearch }
];
