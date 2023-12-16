<script lang="ts">
  import { apiService } from '$lib/apiService';
  import { selectedSongToDownload } from '../../stores/selectedSong';

  export let searchResult: ISearchResult;
  export let index: number = 0;

  async function selectSongToDownload(): Promise<void> {
    try {
      const { bulkSongsToDownload } = await apiService.song_info.get({
        artistId: searchResult.artistId,
        withBulkSongsToDownload: true
      });

      if (bulkSongsToDownload) {
        selectedSongToDownload.set({ ...searchResult, bulkSongsToDownload });
        return;
      } else {
        selectedSongToDownload.set(searchResult);
      }
    } catch (error) {}
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dt
  class="p-2 flex items-center border-b-1 cursor-pointer hover:bg-gray-50 transition"
  on:click={selectSongToDownload}
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
