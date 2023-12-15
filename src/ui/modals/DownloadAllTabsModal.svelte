<script lang="ts">
  import { apiService } from '$lib/apiService';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/triggerDownloadFromSongsterrResponse';
  import Icon from '@iconify/svelte';
  import { melt } from '@melt-ui/svelte';
  import { fade } from 'svelte/transition';
  import { flyAndScale } from '$lib/transitions';
  import {
    AMOUNT_OF_BULK_DOWNLOAD_SONGS_TO_PREVIEW,
    MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD,
    PURCHASER_EMAIL_INPUT_ID
  } from '$lib/constants';
  import CurrencyInput from '../common/inputs/CurrencyInput.svelte';
  import EmailInput from '../common/inputs/EmailInput.svelte';
  import PayPalButton from '../common/buttons/PayPalButton.svelte';

  export let selectedSong: ISearchResult | IPartialSearchResult;
  export let modalProps: {
    overlay?: any;
    content?: any;
    title?: any;
    description?: any;
    close?: any;
  };

  let formParams = {
    purchaserEmail: '',
    donationAmount: MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD
  };

  let shouldShowAllPreviewSongs: boolean = false;

  let previewSongsToDownload =
    selectedSong.bulkSongsToDownload?.slice(
      0,
      AMOUNT_OF_BULK_DOWNLOAD_SONGS_TO_PREVIEW
    ) || [];

  const remainingSongsToDownload =
    selectedSong?.bulkSongsToDownload?.slice(
      AMOUNT_OF_BULK_DOWNLOAD_SONGS_TO_PREVIEW
    ) || [];

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

  function toggleShowAllTabs() {
    shouldShowAllPreviewSongs = !shouldShowAllPreviewSongs;
    if (shouldShowAllPreviewSongs) {
      previewSongsToDownload = selectedSong?.bulkSongsToDownload || [];
    } else {
      previewSongsToDownload =
        selectedSong.bulkSongsToDownload?.slice(
          0,
          AMOUNT_OF_BULK_DOWNLOAD_SONGS_TO_PREVIEW
        ) || [];
    }
  }
</script>

<div
  use:melt={modalProps.overlay}
  class="fixed inset-0 z-50 bg-black/50"
  transition:fade|global={{ duration: 150 }}
/>
<div
  class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            p-6 shadow-lg overflow-scroll"
  use:melt={modalProps.content}
  transition:flyAndScale|global={{
    duration: 150,
    y: 8,
    start: 0.96
  }}
>
  <h2
    use:melt={modalProps.title}
    class="m-0 mb-3 text-lg font-medium text-black"
  >
    Download all tabs from {selectedSong.artist}!
  </h2>
  <p
    use:melt={modalProps.description}
    class="mb-2 leading-normal text-zinc-600"
  >
    A minimum donation of <strong>
      ${MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD}</strong
    >
    is required in order to receive the tabs.
  </p>
  <div class="mb-5 mt-2 leading-normal text-zinc-600">
    <p class="mb-2">Tabs you will receive via email upon purchase:</p>
    <ul class="columns-2">
      {#each previewSongsToDownload as bulkSongToDownload}
        <li class="flex items-center">
          <Icon icon="material-symbols:check" class="text-green-500 mr-1" />
          {bulkSongToDownload.title}
        </li>
      {/each}
      {#if remainingSongsToDownload.length > 0}
        <li class="font-bold flex items-center">
          <span class="mr-2 mt-1">
            {#if shouldShowAllPreviewSongs}
              ... {previewSongsToDownload.length} tabs total!
            {:else}
              ... And {remainingSongsToDownload.length} more!
            {/if}
          </span>
          <button
            on:click={toggleShowAllTabs}
            class="font-light underline cursor-pointer flex items-center hover:opacity-70 transition ease outline-none"
            >Show {shouldShowAllPreviewSongs ? 'less' : 'all'}

            <Icon
              icon="mynaui:chevron-{shouldShowAllPreviewSongs ? 'up' : 'down'}"
              class="text-slate-500 ml-1"
            />
          </button>
        </li>
      {/if}
    </ul>
  </div>

  <form action="">
    <div class="w-3/4">
      <fieldset class="mb-4 flex items-center gap-5">
        <label class="text-black w-1/3" for="email"> Email: </label>
        <EmailInput
          wrapperClass={'w-2/3!'}
          id={PURCHASER_EMAIL_INPUT_ID}
          bind:value={formParams.purchaserEmail}
        />
      </fieldset>
      <fieldset class="mb-4 flex items-center gap-5">
        <label class="text-black w-1/3" for="donationAmount">
          Donation Amount:
        </label>
        <CurrencyInput
          wrapperClass={'w-2/3'}
          value={formParams.donationAmount}
        />
      </fieldset>
    </div>

    <div class="flex justify-between items-center mt-7">
      <div>
        <a
          class="opacity-50 font-light underline flex items-center hover:no-underline hover:opacity-50 transition ease"
          href="/payment-faq"
          target="_blank"
          >Payment FAQ's
          <Icon icon="material-symbols:info" class="ml-1" />
        </a>
      </div>
      <div class="flex justify-end gap-4">
        <!-- <GooglePayButton /> -->
        <PayPalButton
          purchaserEmail={formParams.purchaserEmail}
          donationAmount={formParams.donationAmount}
        />
      </div>
    </div>
    <button
      use:melt={modalProps.close}
      aria-label="close"
      class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none
                  items-center justify-center rounded-full p-1 text-magnum-800
                  hover:bg-magnum-100 focus:shadow-magnum-400"
    >
      <Icon icon="maki:cross" />
    </button>
  </form>
</div>

<style>
  .gradient-row {
    width: 300px;
    margin-bottom: 5px;
    padding-bottom: 5px;
    border-bottom: 3px solid #777;
    max-height: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    content: '';
    position: relative;
  }
</style>
