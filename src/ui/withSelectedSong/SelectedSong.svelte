<script lang="ts">
  import Icon from '@iconify/svelte';
  import { selectedSongToDownload } from '../../stores/selected-song.store';
  export let selectedSong: ISearchResult | IPartialSearchResult;

  function deselectSong(): void {
    selectedSongToDownload.set(undefined);
  }
</script>

<div class="flex items-center bg-slate-100 rounded p-3 shadow-md">
  <div class="mr-auto">
    <p>Song - {selectedSong.title}</p>
    <p class="font-light">Artist - {selectedSong.artist}</p>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <p class="h-4 cursor-pointer" on:click={deselectSong}>
    <Icon icon="fa-solid:times" />
  </p>
</div>
