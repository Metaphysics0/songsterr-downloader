<script lang="ts">
  import Icon from '@iconify/svelte';
  import { createDialog, melt } from '@melt-ui/svelte';
  import DownloadAllTabsModal from '../../modals/DownloadAllTabsModal.svelte';

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
</script>

<button
  class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-amber! hover:bg-amber-300! mb-4 flex items-center"
  use:melt={$trigger}
  disabled={selectedSong?.fromUltimateGuitar}
  >Download All Tabs from {selectedSong.artist}
  <span class="block ml-2">
    <Icon icon="fa-solid:lock" />
  </span>
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
        description: $description
      }}
    />
  {/if}
</div>
