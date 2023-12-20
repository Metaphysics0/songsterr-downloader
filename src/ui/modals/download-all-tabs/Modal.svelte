<script lang="ts">
  import Icon from '@iconify/svelte';
  import { melt } from '@melt-ui/svelte';
  import { fade } from 'svelte/transition';
  import { flyAndScale } from '$lib/transitions';
  import {
    MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD,
    PURCHASER_EMAIL_INPUT_ID
  } from '$lib/constants';
  import EmailInput from '../../common/inputs/EmailInput.svelte';
  import PayPalButton from '../../common/buttons/PayPalButton.svelte';
  import PreviewSongsToDownload from './PreviewSongsToDownload.svelte';
  import { getRequiredPaymentAmountForBulkTabs } from '$lib/utils/getRequiredPaymentAmountForBulkTabs';

  export let selectedSong: ISearchResult | IPartialSearchResult;
  export let modalProps: {
    overlay?: any;
    content?: any;
    title?: any;
    description?: any;
    close?: any;
    closeModal: () => void;
  };

  let formParams = {
    purchaserEmail: '',
    donationAmount: MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD
  };
</script>

<div
  use:melt={modalProps.overlay}
  class="fixed inset-0 z-50 bg-black/50"
  transition:fade|global={{ duration: 150 }}
/>
<div
  class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            p-6 pb-3 shadow-lg overflow-scroll"
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
    A payment of <strong>
      ${getRequiredPaymentAmountForBulkTabs(selectedSong).toFixed(2)}</strong
    >
    is required in order to receive the tabs.
  </p>
  <div class="mb-5 mt-2 leading-normal text-zinc-600">
    <p class="mb-2">Tabs you will receive via email upon purchase:</p>
    <PreviewSongsToDownload {selectedSong} />
  </div>

  <div class="w-3/4 mt-10">
    <fieldset class="flex items-center gap-5">
      <label class="text-black w-1/3" for="email"> Email: </label>
      <EmailInput
        wrapperClass={'md:w-2/3 lg:w-2/3'}
        id={PURCHASER_EMAIL_INPUT_ID}
        bind:value={formParams.purchaserEmail}
      />
    </fieldset>
  </div>

  <div class="flex justify-between items-center mt-2">
    <div>
      <a
        class="font-light underline cursor-pointer flex items-center hover:opacity-70 transition ease outline-none"
        href="/payment-faq"
        target="_blank"
        >Payment FAQ's
        <Icon icon="material-symbols:info" class="ml-1" />
      </a>
    </div>
    <div class="flex justify-end gap-4">
      <PayPalButton
        purchaserEmail={formParams.purchaserEmail}
        {selectedSong}
        closeModal={modalProps.closeModal}
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
