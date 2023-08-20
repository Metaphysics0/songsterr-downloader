<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';
  import Navbar from '../ui/Navbar.svelte';
  import Header from '../ui/Header.svelte';

  inject({ mode: dev ? 'development' : 'production' });
</script>

<Navbar />
<Header />
<slot />
