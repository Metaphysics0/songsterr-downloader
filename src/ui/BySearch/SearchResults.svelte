<script lang="ts">
  import SearchResult from './SearchResult.svelte';
  import type { SongsterrPartialMetadata } from '$lib/types';

  export let searchResults: SongsterrPartialMetadata[] = [];
  export let isLoading: boolean;

  let shouldShowLoadingIndicator = isLoading && searchResults.length === 0;
</script>

<dl
  class={`bg-white rounded max-h-lg overflow-scroll ${
    searchResults.length ? 'border' : ''
  }`}
>
  {#if shouldShowLoadingIndicator}
    <p>Loading...</p>
  {/if}
  {#each searchResults as searchResult, index}
    <SearchResult {searchResult} index={index + 1} />
  {/each}
</dl>
