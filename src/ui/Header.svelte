<script lang="ts">
  import {
    activeTabMenuIndex,
    type ITabMenuIndex
  } from '../stores/activeTabMenu';
  import Link from './common/Link.svelte';

  const headerTextMap: Record<ITabMenuIndex, string> = {
    0: 'Enter in a link',
    1: 'Search all available tabs'
  };

  let headerText = headerTextMap[0];

  let selectedTabMenuIndex: ITabMenuIndex;

  activeTabMenuIndex.subscribe((val) => {
    selectedTabMenuIndex = val;
    headerText = headerTextMap[val];
  });
</script>

<div class="flex flex-col items-center text-center mb-2.5 font-sans">
  <h1 class="text-4xl mb-2 mx-a font-bold">Songsterr Downloader 🎸</h1>
  <p>
    {headerText} from
    <Link href="https://songsterr.com" innerText="Songsterr" />
    {#if selectedTabMenuIndex === 0}
      or <Link
        href="https://www.ultimate-guitar.com/"
        innerText="Ultimate Guitar"
      />
    {/if}
    and click the button to get a
    <Link href="https://www.guitar-pro.com/" innerText="Guitar Pro" />
    file!
  </p>
</div>

<style>
  @media only screen and (max-width: 600px) {
    div {
      padding: 0 20px;
    }
  }
</style>
