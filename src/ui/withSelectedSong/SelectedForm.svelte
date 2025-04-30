<script lang="ts">
  import { apiService } from '$lib/utils/api';
  import { commonCssClasses } from '$lib/utils/css';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/trigger-download-from-songsterr-reponse.util';
  import SelectedSong from './SelectedSong.svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import { selectedSongToDownload } from '../../stores/selected-song.store';

  export let selectedSong: ISearchResult | IPartialSearchResult;

  async function downloadTab(): Promise<void> {
    try {
      if (selectedSong.source) {
        const resp = await apiService.download.bySource(selectedSong);
        triggerFileDownloadFromSongsterrResponse(resp);
        return;
      }

      const resp = await apiService.download.bySearchResult(selectedSong);
      triggerFileDownloadFromSongsterrResponse(resp);
    } catch (error) {
      toast.push('Error downloading tab 😭');
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
  <button class={commonCssClasses.downloadBtn} on:click={downloadTab}
    >Download {selectedSong.title} Tab</button
  >
  <div class="my-2" />

  <button
    class="text-slate-400 font-light underline hover:text-slate-500 bg-transparent mb-1"
    on:click={deselectSong}>Select another?</button
  >
</div>
