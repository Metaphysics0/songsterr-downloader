<script lang="ts">
  import '../app.css';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/common/Header.svelte';
  import { browser } from '$app/environment';
  import favicon from '$lib/assets/favicon.ico';

  if (browser) {
    import('$lib/analytics/mixpanel');
  }

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<SvelteToast />

<header class="mt-12 mb-2.5">
  <Header />
</header>
{@render children()}
