<script lang="ts">
  import { MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD } from '$lib/constants';

  export let value: string = MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD;

  export let wrapperClass: string = '';
</script>

<div class="flex {wrapperClass}">
  <div class="relative w-full">
    <div
      class="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none"
    >
      <svg
        class="w-4 h-4 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1M2 5h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm8 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
        />
      </svg>
    </div>
    <input
      type="number"
      name="paymentAmount"
      id="currency-input"
      class="block p-2.5 w-full z-20 ps-10 text-sm text-gray-900 bg-gray-50 rounded-s-lg border-e-gray-50 border-e-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-e-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 font-bold"
      placeholder="Enter amount"
      step="0.01"
      min={MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD}
      {value}
      required
    />
  </div>
  <button
    id="dropdown-currency-button"
    data-dropdown-toggle="dropdown-currency"
    class="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-e-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600 transition ease cursor-not-allowed opacity-70"
    type="button"
  >
    <svg fill="none" aria-hidden="true" class="h-4 w-4 me-2" viewBox="0 0 20 15"
      ><rect width="19.6" height="14" y=".5" fill="#fff" rx="2" /><mask
        id="a"
        style="mask-type:luminance"
        width="20"
        height="15"
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        ><rect width="19.6" height="14" y=".5" fill="#fff" rx="2" /></mask
      ><g mask="url(#a)"
        ><path
          fill="#D02F44"
          fill-rule="evenodd"
          d="M19.6.5H0v.933h19.6V.5zm0 1.867H0V3.3h19.6v-.933zM0 4.233h19.6v.934H0v-.934zM19.6 6.1H0v.933h19.6V6.1zM0 7.967h19.6V8.9H0v-.933zm19.6 1.866H0v.934h19.6v-.934zM0 11.7h19.6v.933H0V11.7zm19.6 1.867H0v.933h19.6v-.933z"
          clip-rule="evenodd"
        /><path fill="#46467F" d="M0 .5h8.4v6.533H0z" /><g
          filter="url(#filter0_d_343_121520)"
          ><path
            fill="url(#paint0_linear_343_121520)"
            fill-rule="evenodd"
            d="M1.867 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.866 0a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM7.467 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zM2.333 3.3a.467.467 0 100-.933.467.467 0 000 .933zm2.334-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.4.467a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm-2.334.466a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.466a.467.467 0 11-.933 0 .467.467 0 01.933 0zM1.4 4.233a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM6.533 4.7a.467.467 0 11-.933 0 .467.467 0 01.933 0zM7 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zM3.267 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0z"
            clip-rule="evenodd"
          /></g
        ></g
      ><defs
        ><linearGradient
          id="paint0_linear_343_121520"
          x1=".933"
          x2=".933"
          y1="1.433"
          y2="6.1"
          gradientUnits="userSpaceOnUse"
          ><stop stop-color="#fff" /><stop
            offset="1"
            stop-color="#F0F0F0"
          /></linearGradient
        ><filter
          id="filter0_d_343_121520"
          width="6.533"
          height="5.667"
          x=".933"
          y="1.433"
          color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse"
          ><feFlood
            flood-opacity="0"
            result="BackgroundImageFix"
          /><feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          /><feOffset dy="1" /><feColorMatrix
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
          /><feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_343_121520"
          /><feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_343_121520"
            result="shape"
          /></filter
        ></defs
      ></svg
    >
    USD
  </button>
</div>
