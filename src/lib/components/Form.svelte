<script lang="ts">
  import DownloadForm from './DownloadForm.svelte';
  import { formState } from '$lib/runes/form-state.svelte';
  import { fade } from 'svelte/transition';
  import UrlInputForm from './UrlInputForm.svelte';
  import SongPreviewSkeleton from './SongPreviewSkeleton.svelte';
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
  </div>
{/if}
