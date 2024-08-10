<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import type { LayoutData } from './$types';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/general/Header.svelte';
  import { amountOfDownloadsAvailable } from '../stores/amountOfDownloadsAvailable.store';
  import UserButton from 'clerk-sveltekit/client/UserButton.svelte';
  import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
  import SignedOut from 'clerk-sveltekit/client/SignedOut.svelte';
  import SignInButton from 'clerk-sveltekit/client/SignInButton.svelte';
  import Icon from '@iconify/svelte';
  import Navbar from '../ui/general/Navbar.svelte';

  inject({ mode: dev ? 'development' : 'production' });

  export let data: LayoutData;

  amountOfDownloadsAvailable.set(data.amountOfDownloadsAvailable);
</script>

<SvelteToast />
<Navbar />
<Header />
<slot />
