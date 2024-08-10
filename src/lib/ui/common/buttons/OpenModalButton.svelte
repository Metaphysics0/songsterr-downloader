<script lang="ts">
  import { isDialogueOpenStore } from '../../../../stores/isDialogueOpen';

  let isOpen: boolean;

  isDialogueOpenStore.subscribe((val) => {
    isOpen = val;
  });

  function openModal(): void {
    isDialogueOpenStore.set(true);
  }
</script>

<button
  type="button"
  on:click={openModal}
  class="text-orange underline font-semibold text-center mx-auto mb-2 w-fit block"
>
  Experiencing Issues?</button
>
