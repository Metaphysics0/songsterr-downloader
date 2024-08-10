<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import type { LayoutData } from './$types';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '$lib/ui/general/Header.svelte';
  import { amountOfDownloadsAvailable } from '../stores/amountOfDownloadsAvailable.store';
  import { userStore } from '../stores/user.store';
  import Navbar from '$lib/ui/general/Navbar.svelte';

  inject({ mode: dev ? 'development' : 'production' });

  export let data: LayoutData;

  if (data.amountOfDownloadsAvailable) {
    amountOfDownloadsAvailable.set(data.amountOfDownloadsAvailable);
  }

  if (data.user) {
    userStore.set(data.user);
  }
</script>

<SvelteToast />
<Navbar />
<Header />
<slot />
