<script lang="ts">
  import { temporarilyDownModalStore } from '$lib/stores/temporarily-down-modal.store';
</script>

<dialog open={$temporarilyDownModalStore}>
  <h2>We're temporarily down</h2>
  <p>
    Songsterr has recently changed their API, causing this app and similar apps
    to no longer be functioning ):
  </p>
  <p>
    Luckily, songsterr updated the UI/UX for downloading tabs, so this app does
    not have much of a purpose anymore.
  </p>
  <p>
    Thank you to everyone that has used this app, and for all the kind words and
    support.
  </p>
  <p>
    Feel free to donate a cup of coffee to me if you'd like to support me
    continuing to work on this app.
  </p>
  <p>Take care, and stay safe.</p>
  <button on:click={() => ($temporarilyDownModalStore = false)}>Close</button>
</dialog>
