import { writable } from 'svelte/store';
import { SongsterrPartialMetadata } from '$lib/types';

export const selectedSongToDownload = writable<
  SongsterrPartialMetadata | undefined
>();
