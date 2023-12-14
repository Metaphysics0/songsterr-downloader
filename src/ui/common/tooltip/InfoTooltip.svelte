<script lang="ts">
  import { createTooltip, melt } from '@melt-ui/svelte';
  import { fade } from 'svelte/transition';

  let customClasses = '';
  export { customClasses as class };

  export let wrapperClass = '';
  export let placement = 'top';
  export let openDelay = 0;
  export let closeDelay = 0;
  export let closeOnPointerDown = false;
  export let forceVisible = true;
  export let ariaLabel: any = undefined;
  export let text: string;

  const {
    elements: { trigger, content, arrow },
    states: { open }
  } = createTooltip({
    positioning: {
      // @ts-ignore
      placement
    },
    openDelay,
    closeDelay,
    closeOnPointerDown,
    forceVisible
  });
</script>

<div
  class="{wrapperClass} inline-block focus-visible:ring focus-visible:ring-slate-600 focus-visible:ring-offset-2"
  use:melt={$trigger}
  aria-label={ariaLabel}
>
  <slot trigger={$trigger} />
</div>

{#if $open}
  <div
    use:melt={$content}
    transition:fade={{ duration: 75 }}
    class="{customClasses} z-50 rounded-sm bg-white shadow-md dark:bg-gray-700 dark:text-gray-50"
  >
    <div use:melt={$arrow} />
    <p class="px-4 py-1">{text}</p>
  </div>
{/if}
