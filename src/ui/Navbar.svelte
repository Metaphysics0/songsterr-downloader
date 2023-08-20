<script lang="ts">
  import { page } from '$app/stores';
  const routes = [
    {
      title: 'History',
      href: '/history'
    },
    {
      title: 'Home',
      href: '/'
    }
  ];
</script>

<nav class="mb-5 mt-5 w-full flex justify-end px-13 font-sans">
  {#each routes as route}
    <a
      href={route.href}
      class="mx-3 hover:font-bold transition text-md{$page.url.pathname ===
      route.href
        ? ' font-bold'
        : ''}"
    >
      {route.title}
    </a>
  {/each}
</nav>
