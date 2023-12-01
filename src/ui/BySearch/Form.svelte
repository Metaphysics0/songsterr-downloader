<script lang="ts">
  import { selectedSongToDownload } from '../../stores/selectedSong';
  import SelectedForm from '../withSelectedSong/SelectedForm.svelte';
  import SearchForm from './SearchForm.svelte';

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
