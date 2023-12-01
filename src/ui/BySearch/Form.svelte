<script lang="ts">
  import { selectedSongToDownload } from '../../stores/selectedSong';
  import SearchForm from './withoutSelectedSong/SearchForm.svelte';
  import SelectedForm from './withSelectedSong/SelectedForm.svelte';

  let selectedSong: ISearchResult | IPartialSearchResult | undefined;
  selectedSongToDownload.subscribe((value) => {
    selectedSong = value;
  });
</script>

{#if $selectedSongToDownload}
  <SelectedForm selectedSong={$selectedSongToDownload} />
{:else}
  <SearchForm />
{/if}
