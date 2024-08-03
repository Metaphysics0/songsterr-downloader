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

  inject({ mode: dev ? 'development' : 'production' });

  export let data: LayoutData;

  amountOfDownloadsAvailable.set(data.amountOfDownloadsAvailable);
</script>

<SvelteToast />

<nav class="p-2 flex items-end justify-end">
  <SignedIn>
    <UserButton afterSignOutUrl="/" />
  </SignedIn>
  <SignedOut>
    <SignInButton redirectUrl="/" mode="modal" class="p-3">
      <Icon
        icon="fa6-solid:circle-user"
        class="text-3xl cursor-pointer opacity-70 hover:opacity-100"
      />
    </SignInButton>
  </SignedOut>
</nav>
<Header />
<slot />
