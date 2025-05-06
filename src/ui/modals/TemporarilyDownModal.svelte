<script lang="ts">
  import { temporarilyDownModalStore } from '$lib/stores/temporarily-down-modal.store';
</script>

<dialog open={$temporarilyDownModalStore}>
  <h2>We're temporarily down</h2>
  <p>We're currently down for maintenance. We'll be back online shortly.</p>
  <button on:click={() => ($temporarilyDownModalStore = false)}>Close</button>
</dialog>
