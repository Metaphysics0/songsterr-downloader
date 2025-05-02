import { writable } from 'svelte/store';
import type { SongsterrPartialMetadata } from '$lib/types';

// interface SongsterrPartialMetadata {
//   title: string;
//   songId: number;
//   artistId: number;
//   artist: string;
//   source?: string;
//   byLinkUrl?: string;
//   bulkSongsToDownload?: { title: string }[];
// }

export const selectedSongToDownload = writable<
  SongsterrPartialMetadata | undefined
>();
