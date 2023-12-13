<script lang="ts">
  import { apiService } from '$lib/apiService';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/triggerDownloadFromSongsterrResponse';
  import Icon from '@iconify/svelte';
  import { melt } from '@melt-ui/svelte';
  import { fade } from 'svelte/transition';
  import { flyAndScale } from '$lib/transitions';
  import { cssClasses } from '$lib/sharedCssClasses';
  import CurrencyInput from '../common/inputs/CurrencyInput.svelte';
  import { mockSongsYouWillReceive } from '$lib/mocks';
  import { selectedSongToDownload } from '../../stores/selectedSong';
  import { MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD } from '$lib/constants';

  export let modalProps: {
    overlay?: any;
    content?: any;
    title?: any;
    description?: any;
    close?: any;
  };

  export let selectedSong: ISearchResult | IPartialSearchResult;

  const previewSongsToDownload =
    selectedSong?.bulkSongsToDownload?.slice(0, 30) || [];

  const remainingSongsToDownload =
    selectedSong?.bulkSongsToDownload?.slice(30) || [];

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
  <h2 use:melt={modalProps.title} class="m-0 text-lg font-medium text-black">
    Download all tabs from {selectedSong.artist}!
  </h2>
  <p
    use:melt={modalProps.description}
    class="mb-5 mt-2 leading-normal text-zinc-600"
  >
    A minimum donation of ${MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD.toFixed(
      2
    )} is required in order to receive the tabs.
  </p>
  <div class="mb-5 mt-2 leading-normal text-zinc-600">
    <p class="mb-2">Tabs you will receive upon purchase:</p>
    <ul class="columns-2">
      {#each previewSongsToDownload as bulkSongToDownload}
        <li class="flex items-center">
          <Icon icon="material-symbols:check" class="text-green-500 mr-1" />
          {bulkSongToDownload.title}
        </li>
      {/each}
      {#if remainingSongsToDownload.length > 0}
        <li class="font-bold flex items-center">
          ... And {remainingSongsToDownload.length} more!
          <Icon icon="material-symbols:info" class="text-slate-500 ml-1" />
        </li>
      {/if}
    </ul>
  </div>

  <fieldset class="mb-4 flex items-center gap-5">
    <label class="w-[90px] text-right text-black" for="email"> Email: </label>
    <input
      type="email"
      class="inline-flex h-8 w-full flex-1 items-center justify-center
                    rounded-sm border border-solid px-3 leading-none text-black"
      id="email"
      placeholder="email@address.com"
    />
  </fieldset>
  <fieldset class="mb-4 flex items-center gap-5">
    <label class="w-[90px] text-right text-black" for="donationAmount">
      Donation Amount:
    </label>
    <CurrencyInput />
  </fieldset>
  <div class="mt-6 flex justify-end gap-4">
    <button
      use:melt={modalProps.close}
      class="inline-flex h-8 items-center justify-center rounded-sm px-4 font-medium leading-none"
    >
      Cancel
    </button>
    <button
      use:melt={modalProps.close}
      class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-amber! hover:bg-amber-300! mb-4 flex items-center"
      >Purchase 🚀</button
    >
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
</div>
