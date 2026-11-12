<script lang="ts">
  import DownloadForm from './DownloadForm.svelte';
  import { formState } from '$lib/runes/form-state.svelte';
  import { fade } from 'svelte/transition';
  import UrlInputForm from './UrlInputForm.svelte';
  import SongPreviewSkeleton from './SongPreviewSkeleton.svelte';
  import BookmarkletInstructions from './BookmarkletInstructions.svelte';
  import { readSelectedSongFromHash } from '$lib/songsterr/tab-meta';
  import { toastError } from '$lib/utils/toast.util';
  import { replaceState } from '$app/navigation';

  /*
   * The bookmarklet opens this page with the tab metadata in the fragment.
   * It reuses a named window, so a second click lands as a hashchange on an
   * already-open page rather than a fresh load.
   */
  function consumeBookmarkletHash(): void {
    try {
      const song = readSelectedSongFromHash(window.location.hash);
      if (!song) return;
      formState.selectedSong = { ...song, source: 'bookmarklet' };
      formState.songsterrBlocked = false;
    } catch (error) {
      console.error('Invalid bookmarklet payload', error);
      toastError(
        'Could not read that Songsterr tab. Try clicking the bookmark again.'
      );
    }
    clearHash();
  }

  /*
   * Drop the payload from the address bar so a reload or a shared link does
   * not re-open the song. Deferred because SvelteKit's router finishes
   * starting only after the first mount, and replaceState throws before that.
   */
  function clearHash(): void {
    setTimeout(() => {
      if (window.location.hash) {
        replaceState(window.location.pathname + window.location.search, {});
      }
    }, 0);
  }

  $effect(() => {
    consumeBookmarkletHash();
    window.addEventListener('hashchange', consumeBookmarkletHash);
    return () =>
      window.removeEventListener('hashchange', consumeBookmarkletHash);
  });
</script>

{#if formState.isLoadingMetadata && !formState.selectedSong}
  <div in:fade={{ duration: 200 }}>
    <SongPreviewSkeleton />
  </div>
{:else if formState.selectedSong}
  <div in:fade={{ duration: 200 }}>
    <DownloadForm selectedSong={formState.selectedSong} />
  </div>
{:else}
  <div in:fade={{ duration: 200 }}>
    <UrlInputForm />
    <BookmarkletInstructions />
  </div>
{/if}
