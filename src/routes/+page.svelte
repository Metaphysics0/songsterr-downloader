<script>
  import Header from '../ui/Header.svelte';
  import SocialLinks from '../ui/SocialLinks.svelte';
  import TabMenu from '../ui/TabMenu.svelte';
  import NewFeatureBadge from '../ui/common/badges/NewFeatureBadge.svelte';
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
