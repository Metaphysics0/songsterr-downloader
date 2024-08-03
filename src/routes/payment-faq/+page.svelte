<script lang="ts">
  import { cn } from '$lib/utils/css';
  import { createAccordion, melt } from '@melt-ui/svelte';
  import { slide } from 'svelte/transition';
  import Link from '../../ui/common/Link.svelte';

  const {
    elements: { content, item, trigger, root },
    helpers: { isSelected }
  } = createAccordion({
    defaultValue: 'item-1'
  });

  const items = [
    {
      id: 'item-1',
      title: 'How will I receive the tabs I purchased?',
      description:
        'Upon a succesful payment, the tabs will be emailed to you via the email specified in the form, or from the email associated with the payment method.'
    },
    {
      id: 'item-2',
      title: 'Why are you charging for this?',
      description:
        'Due to the intensive server operations required to scrape each tab, the price helps keep this website alive'
    },
    {
      id: 'item-3',
      title:
        "Can't I just download each song individually for the artist I want?",
      description:
        'Sure you can. It might take a lot of time, which is partly why the paid option exists.'
    },
    {
      id: 'item-4',
      title: 'Can I receive a refund for any reason?',
      description:
        "Contact me at ryan@fullstackservices.io, and I'll do what I can to assist you."
    },
    {
      id: 'item-5',
      title: 'When will I receive the tabs in my email after purchase?',
      description:
        'The downloaded tabs should arrive in your email within seconds. Contact me if this does not happen.'
    }
  ];

  let className = '';
  export { className as class };
</script>

<div class="font-sans mb-5 text-center">
  <p class="text-xl">Payment FAQ's</p>
</div>
<main class="font-sans mb-10">
  <div
    class={cn(
      'mx-auto w-[18rem] max-w-full rounded-xl bg-white shadow-lg sm:w-[25rem]',
      className
    )}
    {...$root}
  >
    {#each items as { id, title, description }, i}
      <div
        use:melt={$item(id)}
        class="overflow-hidden transition-colors first:rounded-t-xl
              last:rounded-b-xl"
      >
        <h2 class="flex">
          <button
            use:melt={$trigger(id)}
            class={cn(
              'flex flex-1 cursor-pointer items-center justify-between ',
              'bg-white px-5 py-5 text-base font-medium leading-none',
              'text-black transition-colors hover:bg-neutral-100 focus:!ring-0',
              'focus-visible:text-magnum-800',
              i !== 0 && 'border-t border-t-neutral-300'
            )}
          >
            {title}
          </button>
        </h2>
        {#if $isSelected(id)}
          <div
            class={cn(
              'content',
              'overflow-hidden bg-neutral-100 text-sm text-neutral-600'
            )}
            use:melt={$content(id)}
            transition:slide
          >
            <div class="px-5 py-4">
              {description}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</main>

<footer class="font-sans text-center">
  <Link href="/" target="_self" innerText="Return" cssClass="text-xl" />
</footer>

<style lang="postcss">
  .content {
    box-shadow: inset 0px 1px 0px theme('colors.neutral.300');
  }
</style>
