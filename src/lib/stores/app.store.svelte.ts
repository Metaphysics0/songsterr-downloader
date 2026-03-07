import type { SongsterrPartialMetadata } from '$lib/types';

export const appStore = $state({
  isLoadingMetadata: false,
  selectedSong: undefined as SongsterrPartialMetadata | undefined
});
