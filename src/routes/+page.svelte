<script>
  import Form from '$lib/components/Form.svelte';
  import SocialLinks from '$lib/components/SocialLinks.svelte';
  import { formState } from '$lib/runes/form-state.svelte';
  import { fade } from 'svelte/transition';
</script>

<main class="max-w-md mx-auto">
  <Form />
  {#if !formState.selectedSong && !formState.isLoadingMetadata}
    <div class="mt-8" transition:fade={{ duration: 200 }}>
      <SocialLinks />
    </div>
  {/if}
</main>
