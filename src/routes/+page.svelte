<script>
  import Form from '../ui/ByLink/Form.svelte';
  import { experimentalNoticeModalStore } from '$lib/stores/experimental-notice-modal.store';
</script>

<main class="mb-4 max-w-md mx-auto">
  <Form />
  <p class="text-center text-xs text-gray-400 mt-5">
    This app is currently
    <button
      class="underline cursor-pointer bg-transparent border-none p-0 text-xs text-gray-400 hover:text-gray-600"
      on:click={() => experimentalNoticeModalStore.show()}>experimental</button
    >
  </p>
</main>
