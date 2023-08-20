<script lang="ts">
  import { enhance } from '$app/forms';
  import { cssClasses } from '$lib/sharedCssClasses';
  import { SONGSTERR_URL_REGEX_PATTERN } from '../../consts';
  import { selectedSongToDownload } from '../../stores/selectedSong';
  import {
    setValidationMessage,
    clearValidationMessage
  } from '../../lib/utils/inputUtils';
  import SelectedForm from '../BySearch/withSelectedSong/SelectedForm.svelte';

  let selectedSong: ISearchResult | IPartialSearchResult | undefined;
  selectedSongToDownload.subscribe((value) => {
    selectedSong = value;
  });

  function checkIfInputIsValid(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    isValid = SONGSTERR_URL_REGEX_PATTERN.test(value);

    clearValidationMessage(event);
  }

  let isValid: boolean = false;
</script>

{#if selectedSong}
  <SelectedForm {selectedSong} />
{:else}
  <form
    class="flex flex-col items-center"
    method="POST"
    action="?/getSelectedSongFromUrl"
    use:enhance={({ data }) => {
      const byLinkUrl = data.get('url');

      return async ({ result, update }) => {
        selectedSongToDownload.set({
          // @ts-ignore
          ...result.data,
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
        placeholder="https://www.songsterr.com/a/wsa/structures-hydroplaning-tab-s88503"
        class={cssClasses.textInput}
      />
    </label>
    <button
      disabled={!isValid}
      class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-red-500 hover:bg-red-400 text-white disabled:bg-slate-5 disabled:hover:bg-slate-6 disabled:hover:cursor-not-allowed"
      >Get Tab!</button
    >
  </form>
{/if}
