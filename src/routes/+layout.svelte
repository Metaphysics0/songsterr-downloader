<script lang="ts">
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/common/Header.svelte';
</script>

<SvelteToast />

<header class="my-8 mt-12">
  <Header />
</header>
<slot />
