<script lang="ts">
  import '../app.css';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/common/Header.svelte';

  let { children } = $props();
</script>

<SvelteToast />

<header class="my-8 mt-12">
  <Header />
</header>
{@render children()}
