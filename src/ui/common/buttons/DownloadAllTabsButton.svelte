<script lang="ts">
  import { apiService } from '$lib/apiService';
  import { triggerFileDownloadFromSongsterrResponse } from '$lib/utils/triggerDownloadFromSongsterrResponse';
  import Icon from '@iconify/svelte';
  import { selectedSongToDownload } from '../../../stores/selectedSong';
  import { createDialog, melt } from '@melt-ui/svelte';
  /** Internal helpers */
  import { fade } from 'svelte/transition';
  import { flyAndScale } from '$lib/transitions';

  const {
    elements: {
      trigger,
      overlay,
      content,
      title,
      description,
      close,
      portalled
    },
    states: { open }
  } = createDialog({
    forceVisible: true
  });

  // import { selectedSongToDownload } from '../../stores/selectedSong';
  export let selectedSong: ISearchResult | IPartialSearchResult;

  // selectedSongToDownload.subscribe((song) => {
  //   selectedSong = song;
  // });

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

<button
  class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-amber! hover:bg-amber-300 mb-4 flex items-center"
  use:melt={$trigger}
  >Download All Tabs from {selectedSong.artist}
  <span class="block ml-2">
    <Icon icon="fa-solid:lock" />
  </span>
</button>

<div class="" use:melt={$portalled}>
  {#if $open}
    <div
      use:melt={$overlay}
      class="fixed inset-0 z-50 bg-black/50"
      transition:fade={{ duration: 150 }}
    />
    <div
      class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            p-6 shadow-lg"
      use:melt={$content}
      transition:flyAndScale={{
        duration: 150,
        y: 8,
        start: 0.96
      }}
    >
      <h2 use:melt={$title} class="m-0 text-lg font-medium text-black">
        Download all tabs from {selectedSong.artist}!
      </h2>
      <p use:melt={$description} class="mb-5 mt-2 leading-normal text-zinc-600">
        A minimum donation of $1.00 is required in order to receive the tabs.
      </p>

      <fieldset class="mb-4 flex items-center gap-5">
        <label class="w-[90px] text-right text-black"> Artist: </label>
        <strong>
          {selectedSong.artist}
        </strong>
      </fieldset>
      <fieldset class="mb-4 flex items-center gap-5">
        <label class="w-[90px] text-right text-black" for="email">
          Email:
        </label>
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
        <input
          type="number"
          class="inline-flex h-8 w-full flex-1 items-center justify-center
                    rounded-sm border border-solid px-3 leading-none text-black"
          id="donationAmount"
          min={1.0}
          placeholder="0.00"
          value="1.00"
        />
      </fieldset>
      <div class="mt-6 flex justify-end gap-4">
        <button
          use:melt={$close}
          class="inline-flex h-8 items-center justify-center rounded-sm
                    bg-zinc-100 px-4 font-medium leading-none text-zinc-600"
        >
          Cancel
        </button>
        <button
          use:melt={$close}
          class="inline-flex h-8 items-center justify-center rounded-sm
                    bg-magnum-100 px-4 font-medium leading-none text-magnum-900"
        >
          Save changes
        </button>
      </div>
      <button
        use:melt={$close}
        aria-label="close"
        class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none
                items-center justify-center rounded-full p-1 text-magnum-800
                hover:bg-magnum-100 focus:shadow-magnum-400"
      >
        <Icon icon="maki:cross" />
      </button>
    </div>
  {/if}
</div>
