<script lang="ts">
  import { browser } from '$app/environment';
  import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
  import type { MidiDownloadOptions as MidiDownloadOptionsValue } from '$lib/types';
  import { onMount } from 'svelte';

  const STORAGE_KEY = 'songsterr-downloader:midi-download-options';

  interface Props {
    options: MidiDownloadOptionsValue;
    disabled?: boolean;
  }

  let { options = $bindable(), disabled = false }: Props = $props();

  let container: HTMLDivElement;
  let isPinnedOpen = $state(false);
  let isStorageReady = $state(false);

  onMount(() => {
    try {
      const storedOptions = localStorage.getItem(STORAGE_KEY);

      if (storedOptions) {
        const parsedOptions: unknown = JSON.parse(storedOptions);

        if (typeof parsedOptions === 'object' && parsedOptions !== null) {
          const { separateTracks } =
            parsedOptions as Partial<MidiDownloadOptionsValue>;
          options = { ...options, separateTracks: separateTracks === true };
        }
      }
    } catch {
      // Retain defaults when browser storage is unavailable or malformed.
    }

    isStorageReady = true;

    const handlePointerDown = (event: PointerEvent) => {
      if (!container.contains(event.target as Node)) {
        isPinnedOpen = false;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  });

  $effect(() => {
    if (browser && isStorageReady) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
      } catch {
        // Continue without persistence when browser storage is unavailable.
      }
    }
  });

  function toggleMenu(): void {
    isPinnedOpen = !isPinnedOpen;
  }

  function closeOnEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isPinnedOpen) {
      isPinnedOpen = false;
      container.querySelector<HTMLButtonElement>('button')?.focus();
    }
  }
</script>

<svelte:window onkeydown={closeOnEscape} />

<div
  bind:this={container}
  class="dropdown dropdown-end dropdown-hover"
  class:dropdown-open={isPinnedOpen}
>
  <button
    type="button"
    class="flex h-full items-center rounded border border-slate-500 px-2 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
    aria-label="MIDI download options"
    aria-expanded={isPinnedOpen}
    aria-controls="midi-download-options-menu"
    {disabled}
    onclick={toggleMenu}
  >
    <SettingsIcon class="text-base" />
  </button>

  <ul
    id="midi-download-options-menu"
    class="dropdown-content menu z-10 w-56 rounded-box bg-base-100 text-sm text-slate-600 shadow-md"
  >
    <li>
      <label
        class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50"
      >
        <input
          type="checkbox"
          bind:checked={options.separateTracks}
          {disabled}
          class="checkbox checkbox-xs"
        />
        Export separate named MIDI tracks
      </label>
    </li>
  </ul>
</div>
