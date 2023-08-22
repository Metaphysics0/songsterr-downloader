<script lang="ts">
  import { page } from '$app/stores';
  import { createClassNames } from '$lib/utils/cssUtils';
  import { downloadHistory } from '../stores/downloadHistory';
  $: routes = [
    {
      title: 'History',
      href: '/history',
      shouldDisable: $downloadHistory.length === 0
    },
    {
      title: 'Home',
      href: '/',
      shouldDisable: false
    }
  ];
</script>

<nav class="mb-5 mt-5 w-full flex justify-end px-13 font-sans">
  {#each routes as route}
    <a
      href={route.href}
      class={createClassNames(
        'mx-3 hover:font-bold transition text-md',
        $page.url.pathname === route.href && 'font-bold',
        route.shouldDisable && 'pointer-events-none text-slate-400'
      )}
    >
      {route.title}
    </a>
  {/each}
</nav>
