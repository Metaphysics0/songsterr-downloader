<script lang="ts">
  import DownloadForm from './DownloadForm.svelte';
  import SelectedSongSkeleton from './common/SelectedSongSkeleton.svelte';
  import { formState as appStore } from '$lib/runes/form-state.svelte';
  import { fade } from 'svelte/transition';
  import UrlInputForm from './UrlInputForm.svelte';

  let isLoading: boolean = $state(false);
</script>

{#if isLoading && !appStore.selectedSong}
  <div in:fade={{ duration: 200 }}>
    <SelectedSongSkeleton />
  </div>
{:else if appStore.selectedSong}
  <div in:fade={{ duration: 200 }}>
    <DownloadForm selectedSong={appStore.selectedSong} />
  </div>
{:else}
  <div in:fade={{ duration: 200 }}>
    <UrlInputForm />
  </div>
{/if}
