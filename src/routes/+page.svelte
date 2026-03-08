<script>
  import Form from '../ui/Form.svelte';
  import SocialLinks from '../ui/common/SocialLinks.svelte';
  import { formState as appStore } from '../lib/stores/form-state.svelte';
  import { fade } from 'svelte/transition';
</script>

<main class="mb-4 max-w-md mx-auto">
  <Form />
  {#if !appStore.selectedSong && !appStore.isLoadingMetadata}
    <div class="mt-8" transition:fade={{ duration: 200 }}>
      <SocialLinks />
    </div>
  {/if}
</main>
