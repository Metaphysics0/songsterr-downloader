<script lang="ts">
  import { apiService } from '$lib/utils/api-service.util';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/triggerDownloadFromSongsterrResponse';
  import SelectedSong from './SelectedSong.svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import { cn } from '$lib/utils/css';
  import { openSignInModal } from '$lib/utils/open-sign-in-modal.utill';
  import { cssClasses } from '$lib/constants/css-classes.const';
  import { amountOfDownloadsAvailable } from '../../../stores/amountOfDownloadsAvailable.store';
  import { selectedSongToDownload } from '../../../stores/selectedSong';
  import { userStore } from '../../../stores/user.store';
  import FreeDownloadsRemainingText from '../payments/FreeDownloadsRemainingText.svelte';

  export let selectedSong: ISearchResult | IPartialSearchResult;

  async function downloadTab(): Promise<void> {
    if ($amountOfDownloadsAvailable <= 0 && !$userStore) {
      openSignInModal();
      return;
    }

    if ($amountOfDownloadsAvailable <= 0) {
      console.log('you need to pay');

      return;
    }

    try {
      let response: SongsterrDownloadResponse;
      if (selectedSong.source) {
        response = await apiService.download.bySource(selectedSong);
      } else {
        response = await apiService.download.bySearchResult(selectedSong);
      }

      triggerFileDownloadFromSongsterrResponse(response);
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
    <button
      class={cn(cssClasses.downloadBtn, 'mb-1.5')}
      class:payment_required={$amountOfDownloadsAvailable <= 0}
      on:click={downloadTab}
      >Download {selectedSong.title} Tab
    </button>
    <FreeDownloadsRemainingText />
  </div>

  <button
    class="text-slate-400 font-light underline hover:text-slate-500 bg-transparent"
    on:click={deselectSong}>Select another?</button
  >
</div>

<style>
  button.payment_required {
    /* bg-slate-400 */
    background-color: rgb(203 213 225) !important;
    color: black;
  }
</style>
