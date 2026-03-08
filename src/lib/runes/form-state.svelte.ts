import type { SongsterrPartialMetadata } from '$lib/types';

export const formState = $state({
  isLoadingMetadata: false,
  selectedSong: undefined as SongsterrPartialMetadata | undefined
});
