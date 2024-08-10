<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import type { LayoutData } from './$types';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/general/Header.svelte';
  import { amountOfDownloadsAvailable } from '../stores/amountOfDownloadsAvailable.store';
  import Navbar from '../ui/general/Navbar.svelte';
  import { userStore } from '../stores/user.store';

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
