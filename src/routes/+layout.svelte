<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/common/Header.svelte';
  import TemporarilyDownModal from '../ui/modals/TemporarilyDownModal.svelte';
  import FretwisePromoModal from '../ui/modals/FretwisePromoModal.svelte';

  inject({ mode: dev ? 'development' : 'production' });
</script>

<SvelteToast />

<TemporarilyDownModal />
<FretwisePromoModal />

<header class="my-8 mt-12">
  <Header />
</header>
<slot />
