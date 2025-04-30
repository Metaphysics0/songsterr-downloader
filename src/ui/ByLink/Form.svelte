<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from '@zerodevx/svelte-toast';
  import { selectedSongToDownload } from '../../stores/selected-song.store';
  import {
    setValidationMessage,
    clearValidationMessage
  } from '../../lib/utils/html-input';
  import SelectedForm from '../withSelectedSong/SelectedForm.svelte';
  import { SONGSTERR_URL_REGEX_PATTERN } from '$lib/constants';
  import { isUrlFromSongsterr } from '$lib/utils/url';
  import SelectedSongSkeleton from '../general/SelectedSongSkeleton.svelte';
  import { sample } from 'lodash-es';
  import { placeholderSongUrls } from '$lib/constants/placeholder-songsterr-url.constant';

  let selectedSong: ISearchResult | IPartialSearchResult | undefined;
  selectedSongToDownload.subscribe((value) => {
    selectedSong = value;
  });

  function checkIfInputIsValid(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    isValid = isUrlFromSongsterr(value);

    clearValidationMessage(event);
  }

  let isValid: boolean = false;

  let isLoading: boolean = false;
</script>

{#if isLoading && !selectedSong}
  <SelectedSongSkeleton />
{:else if selectedSong}
  <SelectedForm {selectedSong} />
{:else}
  <form
    class="flex flex-col items-center"
    method="POST"
    action="?/getSelectedSongFromUrl"
    use:enhance={({ formData }) => {
      const byLinkUrl = formData.get('url');

      isLoading = true;
      return async ({ result, update }) => {
        isLoading = false;
        const {
          error,
          searchResult
          // @ts-ignore
        } = result?.data || {};

        if (error) {
          toast.push('Error finding song data from URL 😭', {
            theme: {
              '--toastBarHeight': 0,
              '--toastBackground': '#ef4444',
              '--toastBarBackground': '#7f1d1d'
            }
          });
          console.error('result error', error);
          return;
        }

        selectedSongToDownload.set({
          ...searchResult,
          byLinkUrl
        });
        update({ reset: false });
      };
    }}
  >
    <label for="url" class="w-full">
      Enter in a Songsterr tab url:
      <input
        type="url"
        name="url"
        pattern={SONGSTERR_URL_REGEX_PATTERN.source}
        required
        on:invalid={setValidationMessage}
        on:input={checkIfInputIsValid}
        placeholder={sample(placeholderSongUrls)}
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2 text-center"
      />
    </label>
    <button
      disabled={!isValid}
      class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-red-500 hover:bg-red-400 text-white disabled:bg-slate-5 disabled:hover:bg-slate-6 disabled:hover:cursor-not-allowed"
      >Get Tab!</button
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
