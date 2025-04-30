import { writable } from 'svelte/store';

export const selectedSongToDownload = writable<
  ISearchResult | IPartialSearchResult | undefined
>();
