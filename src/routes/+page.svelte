<script>
  import Header from '../ui/Header.svelte';
  import SocialLinks from '../ui/SocialLinks.svelte';
  import TabMenu from '../ui/TabMenu.svelte';
  import OpenModalButton from '../ui/buttons/OpenModalButton.svelte';
  import TemporarilyDown from '../ui/modals/TemporarilyDown.svelte';
</script>

<TemporarilyDown />
<main class="mb-12">
  <Header />
  <OpenModalButton />
  <TabMenu />
</main>

<footer class="flex flex-col items-center justify-center">
  <SocialLinks />
</footer>
