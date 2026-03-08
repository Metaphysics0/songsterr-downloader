<script lang="ts">
  import { apiService } from '$lib/utils/api';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/trigger-download-from-songsterr-reponse.util';
  import SelectedSong from './SelectedSong.svelte';
  import { appStore } from '$lib/stores/app.store.svelte';
  import type { SongsterrMetadata, SongsterrPartialMetadata } from '$lib/types';
  import Icon from '@iconify/svelte';
  import {
    trackGuitarProDownloaded,
    trackMidiDownloaded
  } from '$lib/analytics/mixpanel';

  interface Props {
    selectedSong: SongsterrMetadata | SongsterrPartialMetadata;
  }

  let { selectedSong }: Props = $props();

  let downloading: 'tab' | 'midi' | null = $state(null);

  async function downloadTab(): Promise<void> {
    if (downloading) return;
    downloading = 'tab';
    try {
      const resp = await apiService.download.byRevisionJson(selectedSong);
      triggerFileDownloadFromSongsterrResponse(resp);
      trackGuitarProDownloaded({
        title: selectedSong.title,
        artist: selectedSong.artist,
        songId: selectedSong.songId
      });
    } catch (error) {
      console.error('error', error);
    } finally {
      downloading = null;
    }
  }

  async function downloadMidi(): Promise<void> {
    if (downloading) return;
    downloading = 'midi';
    try {
      const resp = await apiService.download.byRevisionJsonMidi(selectedSong);
      triggerFileDownloadFromSongsterrResponse(resp);
      trackMidiDownloaded({
        title: selectedSong.title,
        artist: selectedSong.artist,
        songId: selectedSong.songId
      });
    } catch (error) {
      console.error('error', error);
    } finally {
      downloading = null;
    }
  }

  function deselectSong(): void {
    appStore.selectedSong = undefined;
  }
</script>

<div class="flex flex-col items-center">
  <div class="mb-8 w-full">
    <SelectedSong {selectedSong} />
  </div>
  <div class="flex flex-col gap-2 items-center">
    <button
      class="relative flex items-center px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 border border-blue-600 rounded shadow hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      disabled={!!downloading}
      onclick={downloadTab}
    >
      <Icon
        icon="mingcute:guitar-fill"
        class="inline-block mr-1.5 text-base"
      />Download Guitar Pro
      {#if downloading === 'tab'}
        <span class="progress-bar"></span>
      {/if}
    </button>
    <span class="mb-1 font-light">or </span>
    <button
      class="cursor-pointer relative flex items-center px-4 py-1.5 text-sm text-slate-600 border border-slate-500 rounded hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      disabled={!!downloading}
      onclick={downloadMidi}
    >
      <Icon icon="mingcute:midi-line" class="inline-block mr-1.5 text-base" />
      Download MIDI
      {#if downloading === 'midi'}
        <span class="progress-bar"></span>
      {/if}
    </button>
  </div>
  <div class="my-2"></div>

  <button
    class="cursor-pointer text-slate-400 font-light underline hover:text-slate-500 bg-transparent mb-1"
    onclick={deselectSong}>Select another</button
  >
</div>

<style>
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.7);
    animation: progress-loop 1.2s ease-in-out infinite;
  }

  @keyframes progress-loop {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
</style>
