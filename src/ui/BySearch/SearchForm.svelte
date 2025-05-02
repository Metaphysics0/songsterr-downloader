<script lang="ts">
  import type { SongsterrMetadata, SongsterrPartialMetadata } from '$lib/types';
  import { apiService } from '$lib/utils/api';
  import { commonCssClasses } from '$lib/utils/css';
  import { selectedSongToDownload } from '../../lib/stores/selected-song.store';
  import SearchResults from './SearchResults.svelte';

  let selectedSong: SongsterrPartialMetadata | undefined;
  selectedSongToDownload.subscribe((value) => {
    selectedSong = value;
  });

  let searchResults: SongsterrMetadata[] = [];
  async function search(inputText: string): Promise<void> {
    try {
      const { searchResults: searchResultsFromResponse } =
        await apiService.search.bySongOrArtist(inputText);

      searchResults = searchResultsFromResponse.filter(withGuitarProFile);
    } catch (error) {
      console.log('error fetching search results', error);
    } finally {
      isPromiseInProgress = false;
    }
  }

  const withGuitarProFile = (searchResult: SongsterrMetadata) =>
    searchResult.hasPlayer;

  const debounceDurationInMs = 150;
  let timer: any;
  let isPromiseInProgress: boolean = false;
  const debounceThenSearch = (event: Event) => {
    const { value } = <HTMLTextAreaElement>event.target;
    clearTimeout(timer);
    if (value === '') {
      searchResults = [];
      return;
    }
    timer = setTimeout(() => {
      isPromiseInProgress = true;
      search(value);
    }, debounceDurationInMs);
  };
</script>

<label for="artistNameSearch">
  Search by song or artist:
  <input
    type="text"
    name="artistNameSearch"
    on:keyup={debounceThenSearch}
    placeholder="Metallica"
    id="artistNameSearch"
    class={commonCssClasses.textInput}
  />
</label>
<SearchResults {searchResults} isLoading={isPromiseInProgress} />
