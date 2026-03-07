<script lang="ts">
  import '../app.css';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/common/Header.svelte';

  let { children } = $props();
</script>

<SvelteToast />

<header class="mt-12 mb-2.5">
  <Header />
</header>
{@render children()}
