<script lang="ts">
  import { enhance } from '$app/forms';
  import { selectedSongToDownload } from '../../lib/stores/selected-song.store';
  import {
    setValidationMessage,
    clearValidationMessage
  } from '../../lib/utils/html-input';
  import SelectedForm from '../withSelectedSong/SelectedForm.svelte';
  import { SONGSTERR_URL_REGEX_PATTERN } from '$lib/constants';
  import { isUrlFromSongsterr } from '$lib/utils/url';
  import SelectedSongSkeleton from '../common/SelectedSongSkeleton.svelte';
  import { toastError } from '$lib/utils/toast.util';
  import { isLoadingMetadata } from '$lib/stores/loading.store';
  import type { SongsterrPartialMetadata } from '$lib/types';
  import { fade } from 'svelte/transition';

  let selectedSong: SongsterrPartialMetadata | undefined;

  selectedSongToDownload.subscribe((value) => {
    selectedSong = value;
  });

  function setInputValidity(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    isValid = isUrlFromSongsterr(value);

    if (!isValid) {
      setValidationMessage(event);
    } else {
      clearValidationMessage(event);
    }
  }

  let isValid: boolean = false;

  let isLoading: boolean = false;

  let formEl: HTMLFormElement;

  function handlePaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (isUrlFromSongsterr(pastedText)) {
      isValid = true;
      setTimeout(() => formEl?.requestSubmit(), 0);
    }
  }
</script>

{#if isLoading && !selectedSong}
  <div in:fade={{ duration: 200 }}>
    <SelectedSongSkeleton />
  </div>
{:else if selectedSong}
  <div in:fade={{ duration: 200 }}>
    <SelectedForm {selectedSong} />
  </div>
{:else}
  <form in:fade={{ duration: 200 }}
    bind:this={formEl}
    class="flex flex-col items-center"
    method="POST"
    action="?/getMetadataFromTabUrl"
    use:enhance={({ formData }) => {
      const byLinkUrl = formData.get('url');

      isLoading = true;
      $isLoadingMetadata = true;
      return async ({ result, update }) => {
        isLoading = false;
        $isLoadingMetadata = false;
        // @ts-ignore
        const songMetadata = result?.data || {};

        if (!songMetadata) {
          toastError('Error finding song data from URL 😭');
          console.error('result error', result);
          return;
        }

        selectedSongToDownload.set({ ...songMetadata, byLinkUrl });
        update({ reset: false });
      };
    }}
  >
    <label
      for="songsterr-url"
      class="self-start text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      Songsterr tab URL:</label
    >
    <input
      id="songsterr-url"
      type="url"
      name="url"
      pattern={SONGSTERR_URL_REGEX_PATTERN.source}
      required
      on:invalid={setValidationMessage}
      on:input={setInputValidity}
      on:paste={handlePaste}
      placeholder="https://www.songsterr.com/a/wsa/chon-fluffy-tab-s399673"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4 text-center"
    />
    <button
      disabled={!isValid}
      class="flex items-center px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 border border-blue-600 rounded shadow hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >Download</button
    >
  </form>
{/if}

<style>
  @media only screen and (max-width: 500px) {
    label {
      text-align: center;
      width: calc(100% - 1rem);
      margin: auto;
    }
  }
</style>
