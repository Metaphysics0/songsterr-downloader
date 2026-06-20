<script lang="ts">
  import {
    downloadGuitarPro,
    downloadMidi,
    downloadPdf
  } from '$lib/utils/download-tab';
  import SelectedSong from './SongPreview.svelte';
  import { formState } from '$lib/runes/form-state.svelte';
  import type { SongsterrPartialMetadata } from '$lib/types';
  import GuitarIcon from '$lib/icons/GuitarIcon.svelte';
  import MidiIcon from '$lib/icons/MidiIcon.svelte';
  import PdfIcon from '$lib/icons/PdfIcon.svelte';

  interface Props {
    selectedSong: SongsterrPartialMetadata;
  }

  let { selectedSong }: Props = $props();

  type DownloadKind = 'tab' | 'midi' | 'pdf';

  let downloading: DownloadKind | null = $state(null);

  async function run(
    kind: DownloadKind,
    action: (song: SongsterrPartialMetadata) => Promise<void>
  ): Promise<void> {
    if (downloading) return;
    downloading = kind;
    try {
      await action(selectedSong);
    } finally {
      downloading = null;
    }
  }

  function deselectSong(): void {
    formState.selectedSong = undefined;
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
      onclick={() => run('tab', downloadGuitarPro)}
    >
      <GuitarIcon class="inline-block mr-1.5 text-base" />Download Guitar Pro
      {#if downloading === 'tab'}
        <span class="progress-bar"></span>
      {/if}
    </button>
    <span class="mb-1 font-light">or </span>
    <button
      class="cursor-pointer relative flex items-center px-4 py-1.5 text-sm text-slate-600 border border-slate-500 rounded hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      disabled={!!downloading}
      onclick={() => run('midi', downloadMidi)}
    >
      <MidiIcon class="inline-block mr-1.5 text-base" />
      Download MIDI
      {#if downloading === 'midi'}
        <span class="progress-bar"></span>
      {/if}
    </button>
    <button
      class="cursor-pointer relative flex items-center px-4 py-1.5 text-sm text-slate-600 border border-slate-500 rounded hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      disabled={!!downloading}
      onclick={() => run('pdf', downloadPdf)}
    >
      <PdfIcon class="inline-block mr-1.5 text-base" />
      Download PDF
      {#if downloading === 'pdf'}
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
