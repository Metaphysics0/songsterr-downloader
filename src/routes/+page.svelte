<script>
  import Form from '../ui/Form.svelte';
  import SocialLinks from '../ui/common/SocialLinks.svelte';
  import { selectedSongToDownload } from '../lib/stores/selected-song.store';
  import { isLoadingMetadata } from '../lib/stores/loading.store';
  import { fade } from 'svelte/transition';
</script>

<main class="mb-4 max-w-md mx-auto">
  <Form />
  {#if !$selectedSongToDownload && !$isLoadingMetadata}
    <div class="mt-8" transition:fade={{ duration: 200 }}>
      <SocialLinks />
    </div>
  {/if}
</main>
