<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import type { LayoutData } from './$types';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/general/Header.svelte';
  import { amountOfDownloadsAvailable } from '../stores/amountOfDownloadsAvailable.store';

  inject({ mode: dev ? 'development' : 'production' });

  export let data: LayoutData;

  amountOfDownloadsAvailable.set(data.amountOfDownloadsAvailable);
</script>

<SvelteToast />

<nav class="mb-8" />
<Header />
<slot />
