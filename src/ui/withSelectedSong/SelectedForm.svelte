<script lang="ts">
  import { apiService } from '$lib/utils/api';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/trigger-download-from-songsterr-reponse.util';
  import SelectedSong from './SelectedSong.svelte';
  import { selectedSongToDownload } from '../../lib/stores/selected-song.store';
  import type { SongsterrMetadata, SongsterrPartialMetadata } from '$lib/types';
  import { temporarilyDownModalStore } from '$lib/stores/temporarily-down-modal.store';
  import Icon from '@iconify/svelte';

  export let selectedSong: SongsterrMetadata | SongsterrPartialMetadata;

  async function downloadTab(): Promise<void> {
    try {
      const resp = await apiService.download.byRevisionJson(selectedSong);
      triggerFileDownloadFromSongsterrResponse(resp);
    } catch (error) {
      console.error('error', error);
    }
  }

  async function downloadMidi(): Promise<void> {
    try {
      const resp = await apiService.download.byRevisionJsonMidi(selectedSong);
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
  <div class="flex flex-col gap-2 items-center">
    <button
      class="flex items-center px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 border border-blue-600 rounded shadow hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={downloadTab}
      disabled={$temporarilyDownModalStore}
    >
      <Icon
        icon="mingcute:guitar-fill"
        class="inline-block mr-1.5 text-base"
      />Download Guitar Pro</button
    >
    <span class="mb-1 font-light">or </span>
    <button
      class="flex items-center px-4 py-1.5 text-sm text-slate-600 border border-slate-500 rounded hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
      on:click={downloadMidi}
      disabled={$temporarilyDownModalStore}
    >
      <Icon icon="mingcute:midi-line" class="inline-block mr-1.5 text-base" />
      Download MIDI</button
    >
  </div>
  <div class="my-2" />

  <button
    class="text-slate-400 font-light underline hover:text-slate-500 bg-transparent mb-1"
    on:click={deselectSong}>Select another?</button
  >
</div>
