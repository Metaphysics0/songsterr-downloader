<script lang="ts">
  import EyeIcon from '$lib/icons/EyeIcon.svelte';
  import dragVideo from '$lib/assets/bookmarklet-drag.mp4';
  import dragPoster from '$lib/assets/bookmarklet-drag-poster.webp';
  import { trackBookmarkletTutorialViewed } from '$lib/analytics/mixpanel';

  /*
   * Positioned against the nearest `relative` ancestor (the step's <li>), so
   * it spans the card width and opens below the button instead of over it.
   *
   * Opens on hover or keyboard focus, and toggles on click so it also works
   * on touch screens, which have no hover. A click "pins" it open until the
   * next click, Escape, or a click elsewhere.
   */
  let hovered = $state(false);
  let pinned = $state(false);
  const isOpen = $derived(hovered || pinned);

  // Don't fetch the clip until someone asks to see it; keep it mounted after
  // so re-opening is instant.
  let hasOpened = $state(false);
  let root: HTMLSpanElement | undefined = $state();

  // Reduced-motion users get the still mid-drag frame instead of a loop.
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markOpened(): void {
    if (hasOpened) return;
    hasOpened = true;
    trackBookmarkletTutorialViewed();
  }

  function setHovered(value: boolean): void {
    hovered = value;
    if (value) markOpened();
  }

  function togglePinned(): void {
    pinned = !pinned;
    if (pinned) markOpened();
  }

  function onDocumentClick(event: MouseEvent): void {
    if (pinned && root && !root.contains(event.target as Node)) pinned = false;
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      pinned = false;
      hovered = false;
    }
  }
</script>

<svelte:document onclick={onDocumentClick} onkeydown={onKeydown} />

<span
  bind:this={root}
  class="inline-flex align-middle"
  role="presentation"
  onmouseenter={() => setHovered(true)}
  onmouseleave={() => setHovered(false)}
>
  <button
    type="button"
    class="ml-1 p-0.5 rounded text-slate-500 hover:text-blue-500 focus-visible:text-blue-500 cursor-pointer"
    aria-label="Show how to drag the button"
    aria-expanded={isOpen}
    aria-controls="bookmarklet-drag-preview"
    onclick={togglePinned}
    onfocus={() => setHovered(true)}
    onblur={() => setHovered(false)}
  >
    <EyeIcon class="h-4 w-4" />
  </button>

  {#if hasOpened}
    <span
      id="bookmarklet-drag-preview"
      class="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-slate-300 bg-white p-1.5 shadow-xl dark:border-slate-600 dark:bg-slate-800"
      class:hidden={!isOpen}
      role="tooltip"
    >
      {#if reducedMotion}
        <img
          class="block w-full rounded"
          src={dragPoster}
          width="480"
          height="428"
          alt="Dragging the Songsterr Downloader button up into the browser's bookmarks bar"
        />
      {:else}
        <video
          class="block w-full rounded"
          src={dragVideo}
          poster={dragPoster}
          width="480"
          height="428"
          autoplay
          loop
          muted
          playsinline
          aria-label="Dragging the Songsterr Downloader button up into the browser's bookmarks bar"
        ></video>
      {/if}
      <span class="mt-1 block text-center text-xs text-slate-500">
        Drag the button up into your bookmarks bar
      </span>
    </span>
  {/if}
</span>
