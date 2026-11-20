<script lang="ts">
  import { fade } from 'svelte/transition';
  import { trackHireLinkClicked } from '$lib/analytics/mixpanel';

  // Shown after a successful download, when people just got value from the app.
  const HIRE_URL = 'https://ryanroberts.dev/build';
</script>

<p
  in:fade={{ duration: 300, delay: 400 }}
  class="max-w-xs mx-auto mt-6 pt-4 border-t border-base-300 text-sm text-center leading-relaxed opacity-80"
>
  Glad it worked! I'm Ryan, and I built this on weekends. I also build web apps
  for people and teams.
  <a
    href={HIRE_URL}
    target="_blank"
    rel="noopener"
    onclick={() => trackHireLinkClicked('after-download')}
    class="font-bold text-blue-400 hover:text-blue-500 whitespace-nowrap"
    >See what I can build for you →</a
  >
</p>
