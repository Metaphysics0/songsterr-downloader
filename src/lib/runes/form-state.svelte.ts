import type { SelectedSong } from '$lib/types';

export const formState = $state({
  isLoadingMetadata: false,
  selectedSong: undefined as SelectedSong | undefined,
  // Set when the server reports Songsterr blocked the link lookup, so the UI
  // can point people at the bookmarklet.
  songsterrBlocked: false
});
