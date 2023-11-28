<script lang="ts">
  import {
    Dialog,
    DialogOverlay,
    DialogTitle,
    Transition,
    TransitionChild
  } from '@rgossiaux/svelte-headlessui';
  import { isDialogueOpenStore } from '../../stores/isDialogueOpen';

  let isOpen: boolean;

  isDialogueOpenStore.subscribe((val) => {
    isOpen = val;
  });

  function closeModal(): void {
    isDialogueOpenStore.set(false);
  }
  function openModal(): void {
    isDialogueOpenStore.set(true);
  }
</script>

<Transition appear show={isOpen}>
  <Dialog
    as="div"
    class="fixed inset-0 z-10 overflow-y-auto"
    on:close={closeModal}
  >
    <div class="min-h-screen px-4 text-center">
      <TransitionChild
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <DialogOverlay class="fixed inset-0" />
      </TransitionChild>

      <TransitionChild
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>
        <div
          class="inline-block w-full max-w-md p-10 my-8 mb-45 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          <DialogTitle
            as="h3"
            class="text-xl font-medium leading-6 w-max text-gray-900"
          >
            Website is currently under maintenence 🥲
          </DialogTitle>
          <div class="mt-2">
            <p class="text-md text-gray-500">
              It looks like Songsterr discovered this app and has since added
              some blocking mechanisms to prevent users from using this app.
            </p>
            <br />
            <p class="text-md text-gray-500">
              I am actively working on a solution. Thank you for your
              understanding. - Ryan (November 2023)
            </p>
          </div>

          <div class="mt-6 mx-auto w-fit">
            <button
              type="button"
              class="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-200! border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              on:click={closeModal}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </TransitionChild>
    </div>
  </Dialog>
</Transition>
