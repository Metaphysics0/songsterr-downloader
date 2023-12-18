<script lang="ts">
  import { AMOUNT_OF_BULK_DOWNLOAD_SONGS_TO_PREVIEW } from '$lib/constants';
  import Icon from '@iconify/svelte';

  export let selectedSong: ISearchResult | IPartialSearchResult;
  let shouldShowAllPreviewSongs: boolean = false;

  let previewSongsToDownload =
    selectedSong.bulkSongsToDownload?.slice(
      0,
      AMOUNT_OF_BULK_DOWNLOAD_SONGS_TO_PREVIEW
    ) || [];

  const remainingSongsToDownload =
    selectedSong?.bulkSongsToDownload?.slice(
      AMOUNT_OF_BULK_DOWNLOAD_SONGS_TO_PREVIEW
    ) || [];

  function toggleShowAllTabs() {
    shouldShowAllPreviewSongs = !shouldShowAllPreviewSongs;
    if (shouldShowAllPreviewSongs) {
      previewSongsToDownload = selectedSong?.bulkSongsToDownload || [];
    } else {
      previewSongsToDownload =
        selectedSong.bulkSongsToDownload?.slice(
          0,
          AMOUNT_OF_BULK_DOWNLOAD_SONGS_TO_PREVIEW
        ) || [];
    }
  }
</script>

<ul class="columns-2">
  {#each previewSongsToDownload as bulkSongToDownload}
    <li class="flex items-center">
      <Icon icon="material-symbols:check" class="text-green-500 mr-1" />
      {bulkSongToDownload.title}
    </li>
  {/each}
  {#if remainingSongsToDownload.length > 0}
    <li class="font-bold flex items-center">
      <span class="mr-2 mt-1">
        {#if shouldShowAllPreviewSongs}
          ... {previewSongsToDownload.length} tabs total!
        {:else}
          ... And {remainingSongsToDownload.length} more!
        {/if}
      </span>
      <button
        on:click={toggleShowAllTabs}
        class="font-light underline cursor-pointer flex items-center hover:opacity-70 transition ease outline-none"
        >Show {shouldShowAllPreviewSongs ? 'less' : 'all'}

        <Icon
          icon="mynaui:chevron-{shouldShowAllPreviewSongs ? 'up' : 'down'}"
          class="text-slate-500 ml-1"
        />
      </button>
    </li>
  {/if}
</ul>
