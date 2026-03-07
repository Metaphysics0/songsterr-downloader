<script lang="ts">
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '../ui/common/Header.svelte';
  import TemporarilyDownModal from '../ui/modals/TemporarilyDownModal.svelte';
</script>

<SvelteToast />

<TemporarilyDownModal />

<header class="my-8 mt-12">
  <Header />
</header>
<slot />
