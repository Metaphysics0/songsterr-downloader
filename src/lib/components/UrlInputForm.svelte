<script lang="ts">
  import { enhance } from '$app/forms';
  import {
    setValidationMessage,
    clearValidationMessage,
    isUrlFromSongsterr,
    SONGSTERR_URL_REGEX_PATTERN
  } from '$lib/utils/input-validation';
  import { toastError } from '$lib/utils/toast.util';
  import { formState } from '$lib/runes/form-state.svelte';

  function setInputValidity(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    isValid = isUrlFromSongsterr(value);

    if (!isValid) {
      setValidationMessage(event);
    } else {
      clearValidationMessage(event);
    }
  }

  let isValid: boolean = $state(false);
  let isLoading: boolean = $state(false);

  let formEl: HTMLFormElement | undefined = $state();

  function handlePaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (isUrlFromSongsterr(pastedText)) {
      isValid = true;
      setTimeout(() => formEl?.requestSubmit(), 0);
    }
  }
</script>

<form
  bind:this={formEl}
  class="flex flex-col items-center"
  method="POST"
  action="?/getMetadataFromTabUrl"
  use:enhance={({ formData }) => {
    const byLinkUrl = formData.get('url');
    formState.isLoadingMetadata = true;
    return async ({ result, update }) => {
      formState.isLoadingMetadata = false;
      // @ts-ignore
      const songMetadata = result?.data || {};

      if (!songMetadata) {
        toastError('Error finding song data from URL 😭');
        console.error('result error', result);
        return;
      }

      formState.selectedSong = { ...songMetadata, byLinkUrl };
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
    oninvalid={setValidationMessage}
    oninput={setInputValidity}
    onpaste={handlePaste}
    placeholder="https://www.songsterr.com/a/wsa/chon-fluffy-tab-s399673"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4 text-center"
  />
  <button
    disabled={!isValid}
    class="flex items-center px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 border border-blue-600 rounded shadow hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >Download</button
  >
</form>

<style>
  @media only screen and (max-width: 500px) {
    label {
      text-align: center;
      width: calc(100% - 1rem);
      margin: auto;
    }
  }
</style>
