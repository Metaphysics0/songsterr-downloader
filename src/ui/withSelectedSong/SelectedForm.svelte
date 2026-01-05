<script lang="ts">
  import { apiService } from '$lib/utils/api';
  import { commonCssClasses } from '$lib/utils/css';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/trigger-download-from-songsterr-reponse.util';
  import SelectedSong from './SelectedSong.svelte';
  import { selectedSongToDownload } from '../../lib/stores/selected-song.store';
  import type { SongsterrMetadata, SongsterrPartialMetadata } from '$lib/types';
  import { temporarilyDownModalStore } from '$lib/stores/temporarily-down-modal.store';

  export let selectedSong: SongsterrMetadata | SongsterrPartialMetadata;

  async function downloadTab(): Promise<void> {
    try {
      const apiMethod = selectedSong.source ? 'bySource' : 'bySearchResult';
      const resp = await apiService.download[apiMethod](selectedSong);
      triggerFileDownloadFromSongsterrResponse(resp);
    } catch (error) {
      console.error('error', error);
    }
  }

  function deselectSong(): void {
    selectedSongToDownload.set(undefined);
  }
</script>

<div class="flex flex-col items-center">
  <div class="mb-8 w-full">
    <SelectedSong {selectedSong} />
  </div>
  <button
    class={commonCssClasses.getTabButton}
    on:click={downloadTab}
    disabled={$temporarilyDownModalStore}
    >Download {selectedSong.title} Tab</button
  >
  <div class="my-2" />

  <button
    class="text-slate-400 font-light underline hover:text-slate-500 bg-transparent mb-1"
    on:click={deselectSong}>Select another?</button
  >
</div>
