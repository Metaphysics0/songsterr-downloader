<script lang="ts">
  import { page } from '$app/state';
  import { buildBookmarkletHref } from '$lib/bookmarklet/bookmarklet';
  import { formState } from '$lib/runes/form-state.svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import { trackBookmarkletDragged } from '$lib/analytics/mixpanel';

  const href = $derived(buildBookmarkletHref(`${page.url.origin}/`));

  // Expanded by default; re-opens if a blocked link lookup happens after
  // the user collapsed it.
  let open = $state(true);
  $effect(() => {
    if (formState.songsterrBlocked) open = true;
  });

  function preventRunningHere(event: MouseEvent): void {
    // Clicking it here would only run it on our own page.
    event.preventDefault();
    toast.push(
      'Drag this button to your bookmarks bar, then click it on a Songsterr tab.'
    );
  }
</script>

<details
  class="mt-6 rounded-lg border border-slate-300 dark:border-slate-600 p-4 text-sm"
  bind:open
>
  <summary class="cursor-pointer font-semibold">
    {#if formState.songsterrBlocked}
      Songsterr is blocking links right now. Use this instead 👇
    {:else}
      Not working? Use the bookmarklet
    {/if}
  </summary>

  <ol
    class="list-decimal ml-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300"
  >
    <li>
      Drag this button to your bookmarks bar:
      <div class="my-2">
        <a
          {href}
          onclick={preventRunningHere}
          ondragstart={trackBookmarkletDragged}
          draggable="true"
          class="inline-block px-3 py-1 font-semibold text-white bg-blue-500 border border-blue-600 rounded shadow cursor-grab"
          >⬇ Songsterr Downloader</a
        >
      </div>
      <span class="text-xs text-slate-500">
        Don't see a bookmarks bar? Press Ctrl+Shift+B (⌘+Shift+B on Mac).
      </span>
    </li>
    <li>Open any song tab on songsterr.com.</li>
    <li>
      Click the bookmark. This page opens with the song ready to download.
    </li>
  </ol>

  <p class="mt-3 text-xs text-slate-500">
    The bookmark reads the tab from the Songsterr page you already have open,
    and the download is built in your browser. Works best in desktop browsers.
  </p>
</details>
