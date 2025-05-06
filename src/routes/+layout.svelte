<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/common/Header.svelte';
  import TemporarilyDownModal from '../ui/modals/TemporarilyDownModal.svelte';

  inject({ mode: dev ? 'development' : 'production' });
</script>

<SvelteToast />

<TemporarilyDownModal />

<nav class="mb-8" />
<Header />
<slot />
