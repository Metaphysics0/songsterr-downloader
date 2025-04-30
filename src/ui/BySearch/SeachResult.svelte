<script lang="ts">
  import { selectedSongToDownload } from '../../stores/selected-song.store';

  export let searchResult: ISearchResult;
  export let index: number = 0;
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dt
  class="p-2 flex items-center border-b-1 cursor-pointer hover:bg-gray-50 transition"
  on:click={() => selectedSongToDownload.set(searchResult)}
  on:keydown={({ key }) => console.log('key pressed:', key)}
>
  {#if index !== 0}
    <span class="mr-3">
      {index}.
    </span>
  {/if}
  <div>
    <p>{searchResult.title}</p>
    <p class="font-light">{searchResult.artist}</p>
  </div>
</dt>
