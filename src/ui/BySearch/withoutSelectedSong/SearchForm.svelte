<script lang="ts">
  import { apiService } from '$lib/apiService';
  import { cssClasses } from '$lib/sharedCssClasses';
  import { selectedSongToDownload } from '../../../stores/selectedSong';
  import TextInput from '../../inputs/TextInput.svelte';
  import SearchResults from './SearchResults.svelte';

  let selectedSong: ISearchResult | IPartialSearchResult | undefined;
  selectedSongToDownload.subscribe((value) => {
    selectedSong = value;
  });

  let searchResults: ISearchResult[] = [];
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

  const withGuitarProFile = (searchResult: ISearchResult) =>
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
    class={cssClasses.textInput}
  />
</label>
<SearchResults {searchResults} isLoading={isPromiseInProgress} />
