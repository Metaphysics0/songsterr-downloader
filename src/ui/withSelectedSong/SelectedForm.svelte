<script lang="ts">
  import { apiService } from '$lib/apiService';
  import { cssClasses } from '$lib/sharedCssClasses';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/triggerDownloadFromSongsterrResponse';
  import SelectedSong from './SelectedSong.svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import { selectedSongToDownload } from '../../stores/selectedSong';
  import DownloadAllTabsButton from '../common/buttons/DownloadAllTabsButton.svelte';

  export let selectedSong: ISearchResult | IPartialSearchResult;

  async function downloadTab(): Promise<void> {
    try {
      if (selectedSong.fromUltimateGuitar) {
        const resp = await apiService.download.fromUltimateGuitar(selectedSong);
        triggerFileDownloadFromSongsterrResponse(resp);
        return;
      }

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

  async function downloadAllTabsFromArtist(): Promise<void> {
    const secretAccessCode = prompt(
      'This is currently an experimental feature. Please enter in the secret in order to try it. 👀'
    );

    if (!secretAccessCode) {
      alert('Invalid input, sorry 🤷‍♂️');
      return;
    }

    const resp = await apiService.download.bulkDownload({
      selectedSong,
      secretAccessCode
    });

    triggerFileDownloadFromSongsterrResponse(resp);
  }

  function deselectSong(): void {
    selectedSongToDownload.set(undefined);
  }
</script>

<div class="flex flex-col items-center">
  <div class="mb-8 w-full">
    <SelectedSong {selectedSong} />
  </div>
  <button class={cssClasses.downloadBtn} on:click={downloadTab}
    >Download {selectedSong.title} Tab</button
  >
  <strong class="my-2">Or</strong>
  <DownloadAllTabsButton {selectedSong} />

  <button
    class="text-slate-400 font-light underline hover:text-slate-500 bg-transparent"
    on:click={deselectSong}>Select another?</button
  >
</div>
