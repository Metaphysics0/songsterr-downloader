import { writable } from 'svelte/store';

export const activeTabMenuIndex = writable<ITabMenuIndex>(0);
export type ITabMenuIndex = 0 | 1;

export const selectedSongToDownload = writable<ISearchResult | undefined>();
