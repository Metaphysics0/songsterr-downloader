<script lang="ts">
  import { apiService } from '$lib/apiService';
  import { cssClasses } from '$lib/sharedCssClasses';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/triggerDownloadFromSongsterrResponse';
  import SelectedSong from './SelectedSong.svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import { selectedSongToDownload } from '../../stores/selectedSong';
  import { amountOfDownloadsAvailable } from '../../stores/amountOfDownloadsAvailable.store';
  import { cn } from '$lib/utils/css';

  export let selectedSong: ISearchResult | IPartialSearchResult;

  async function downloadTab(): Promise<void> {
    try {
      let response: SongsterrDownloadResponse;
      if (selectedSong.source) {
        response = await apiService.download.bySource(selectedSong);
      } else {
        response = await apiService.download.bySearchResult(selectedSong);
      }

      triggerFileDownloadFromSongsterrResponse(response);
      console.log('RESPONSE', response);

      amountOfDownloadsAvailable.set(response.amountOfDownloadsAvailable);
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
  <div class="flex flex-col items-center mb-5">
    <button class={cn(cssClasses.downloadBtn, 'mb-1.5')} on:click={downloadTab}
      >Download {selectedSong.title} Tab
    </button>
    <span class="font-light font-italic opacity-60">
      {$amountOfDownloadsAvailable} free daily download{$amountOfDownloadsAvailable >
      1
        ? 's'
        : ''} remaining!
    </span>
  </div>

  <button
    class="text-slate-400 font-light underline hover:text-slate-500 bg-transparent"
    on:click={deselectSong}>Select another?</button
  >
</div>
