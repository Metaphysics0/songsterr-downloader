<script lang="ts">
  import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
  import UserButton from 'clerk-sveltekit/client/UserButton.svelte';
  import SignedOut from 'clerk-sveltekit/client/SignedOut.svelte';
  import SignInButton from 'clerk-sveltekit/client/SignInButton.svelte';
  import Icon from '@iconify/svelte';
  import { GLOBAL_NAV_ID } from '$lib/constants/dom-element-ids.const';
</script>

<nav class="p-2 flex items-end justify-end" id={GLOBAL_NAV_ID}>
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
