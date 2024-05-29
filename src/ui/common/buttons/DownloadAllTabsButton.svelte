<script lang="ts">
  import { createDialog, melt } from '@melt-ui/svelte';
  import DownloadAllTabsModal from '../../modals/download-all-tabs/Modal.svelte';
  import Icon from '@iconify/svelte';

  const {
    elements: {
      trigger,
      overlay,
      content,
      title,
      description,
      close,
      portalled
    },
    states: { open }
  } = createDialog({
    forceVisible: true
  });

  export let selectedSong: ISearchResult | IPartialSearchResult;

  let shouldDisable = true;
  // selectedSong?.fromUltimateGuitar ||
  // !selectedSong?.bulkSongsToDownload?.length;

  function closeModal(): void {
    open.set(false);
  }
</script>

<button
  class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-yellow! hover:bg-yellow-300! mb-4 flex items-center"
  class:disabled={selectedSong?.fromUltimateGuitar}
  use:melt={$trigger}
  disabled={shouldDisable}
  >Download All Tabs from {selectedSong.artist}
  <Icon icon="material-symbols:lock" class="ml-1" />
</button>

<div class="" use:melt={$portalled}>
  {#if $open}
    <DownloadAllTabsModal
      {selectedSong}
      modalProps={{
        close: $close,
        overlay: $overlay,
        content: $content,
        title: $title,
        description: $description,
        closeModal
      }}
    />
  {/if}
</div>

<style>
  button:disabled {
    /* bg-slate-400 */
    /* background-color: rgb(148 163 184) !important; */
    background-color: rgb(203 213 225) !important;
    cursor: not-allowed;
  }
</style>
