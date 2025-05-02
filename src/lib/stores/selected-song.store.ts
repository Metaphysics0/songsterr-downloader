import { writable } from 'svelte/store';
import type { SongsterrPartialMetadata } from '$lib/types';

export const selectedSongToDownload = writable<
  SongsterrPartialMetadata | undefined
>();
