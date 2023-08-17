<script lang="ts">
  import { apiService } from '$lib/apiService';
  import { cssClasses } from '$lib/sharedCssClasses';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/triggerDownloadFromSongsterrResponse';
  import { selectedSongToDownload } from '../../../stores/selectedSong';
  import SelectedSong from './SelectedSong.svelte';
  // @ts-ignore
  import FaLock from 'svelte-icons/fa/FaLock.svelte';

  export let selectedSong: ISearchResult | IPartialSearchResult;

  async function downloadTabFromSearchResult(): Promise<void> {
    const resp = await apiService.download.bySearchResult(selectedSong);
    triggerFileDownloadFromSongsterrResponse(resp);
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
  <button class={cssClasses.downloadBtn} on:click={downloadTabFromSearchResult}
    >Download {selectedSong.title} Tab</button
  >
  <strong class="my-2">Or</strong>
  <button
    class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-amber hover:bg-amber-300 mb-4 flex items-center"
    on:click={downloadAllTabsFromArtist}
    >Download All Tabs from {selectedSong.artist}
    <span class="block ml-2 h-3">
      <FaLock />
    </span>
  </button>

  <button
    class="text-slate-400 font-light underline hover:text-slate-500"
    on:click={deselectSong}>Select another?</button
  >
</div>
