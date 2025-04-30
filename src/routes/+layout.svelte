<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/common/Header.svelte';

  inject({ mode: dev ? 'development' : 'production' });
</script>

<SvelteToast />

<nav class="mb-8" />
<Header />
<slot />
