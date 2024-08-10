<script>
  import NewFeatureBadge from '$lib/ui/common/badges/NewFeatureBadge.svelte';
  import SocialLinks from '$lib/ui/general/SocialLinks.svelte';
  import TabMenu from '$lib/ui/general/TabMenu.svelte';
</script>

<main class="mb-4">
  <TabMenu />
</main>

<section class="text-center mb-5">
  <NewFeatureBadge />
</section>

<footer class="flex flex-col items-center justify-center h-max">
  <SocialLinks />
</footer>
