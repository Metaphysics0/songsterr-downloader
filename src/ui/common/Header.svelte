<script lang="ts">
  import { page } from '$app/stores';
  import Link from './Link.svelte';

  const headerText = 'Enter in a link';
</script>

<div class="flex flex-col items-center text-center mb-2.5 font-sans">
  <h1 class="text-4xl mb-2 mx-a font-bold">Songsterr Downloader 🎸</h1>
  {#if $page.url.pathname === '/'}
    <p>
      {headerText} from
      <Link href="https://songsterr.com" innerText="Songsterr" />
      and click the button to get a
      <Link href="https://www.guitar-pro.com/" innerText="Guitar Pro" />
      file!
    </p>
  {/if}
</div>

<style>
  @media only screen and (max-width: 600px) {
    div {
      padding: 0 20px;
    }
  }
</style>
