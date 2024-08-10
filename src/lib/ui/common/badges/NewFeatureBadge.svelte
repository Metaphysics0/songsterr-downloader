<script lang="ts">
  import { activeTabMenuIndex } from '../../../../stores/activeTabMenu';
  import { selectedSongToDownload } from '../../../../stores/selectedSong';

  let isSearchFormEnabled: boolean;
  let hasSelectedSong: boolean;

  selectedSongToDownload.subscribe((selectedSong) => {
    hasSelectedSong = !!selectedSong;
  });

  activeTabMenuIndex.subscribe((idx) => {
    isSearchFormEnabled = idx === 1;
  });

  $: shouldHide = true;
</script>

{#if !shouldHide}
  <span class="font-sans text-amber-5 font-bold">
    Now with Ultimate Guitar Support!
  </span>
{/if}
