<script lang="ts">
  import Icon from '@iconify/svelte';
  import { formState } from '$lib/stores/form-state.svelte';
  import type { SongsterrPartialMetadata } from '$lib/types';

  interface Props {
    selectedSong: SongsterrPartialMetadata;
  }

  let { selectedSong }: Props = $props();

  function deselectSong(): void {
    formState.selectedSong = undefined;
  }
</script>

<div class="flex items-center bg-slate-100 rounded p-3 shadow-md">
  <div class="mr-auto">
    <p>Song - {selectedSong.title}</p>
    <p class="font-light">Artist - {selectedSong.artist}</p>
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <p class="h-4 cursor-pointer" onclick={deselectSong}>
    <Icon icon="fa-solid:times" />
  </p>
</div>
