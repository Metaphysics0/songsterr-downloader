<script lang="ts">
  import { selectedSongToDownload } from '../../lib/stores/selected-song.store';
  import SelectedForm from '../withSelectedSong/SelectedForm.svelte';
  import SearchForm from './SearchForm.svelte';
</script>

{#if $selectedSongToDownload}
  <SelectedForm selectedSong={$selectedSongToDownload} />
{:else}
  <SearchForm />
{/if}
