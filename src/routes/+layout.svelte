<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { dev } from '$app/environment';
  import 'uno.css';
  import '@unocss/reset/tailwind.css';

  inject({ mode: dev ? 'development' : 'production' });
</script>

<nav class="mb-8" />
<slot />
