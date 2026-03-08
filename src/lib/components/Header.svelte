<script lang="ts">
  import Link from './Link.svelte';
</script>

<div class="flex flex-col items-center text-center font-sans">
  <h1 class="text-4xl mb-2 mx-auto font-bold">Songsterr Downloader</h1>
  <p>
    Enter in a link from
    <Link href="https://songsterr.com" innerText="Songsterr" />
    to get a
    <Link href="https://www.guitar-pro.com/" innerText="Guitar Pro" />
    or MIDI file!
  </p>
</div>

<style>
  @media only screen and (max-width: 600px) {
    div {
      padding: 0 20px;
    }
  }
</style>
