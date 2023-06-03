<script lang="ts">
	import { apiService } from '$lib/apiService';
	import { cssClasses } from '$lib/sharedCssClasses';
	import { selectedSongToDownload } from '../../../../stores/activeTabMenu';
	import SearchResults from './SearchResults.svelte';

	let selectedSong: ISearchResult | undefined;
	selectedSongToDownload.subscribe((value) => {
		selectedSong = value;
	});

	let searchResults: ISearchResult[] = [];
	async function searchForArtists(inputText: string): Promise<void> {
		try {
			const response = await apiService.search.bySongOrArtist(inputText);
			const data = await response.json();

			searchResults = data.searchResults;
		} catch (error) {
			console.log('error fetching search results', error);
		} finally {
			isPromiseInProgress = false;
		}
	}

	const debounceDurationInMs = 150;
	let timer: any;
	let isPromiseInProgress: boolean = false;
	const debounceThenSearchForArtists = (event: Event) => {
		const { value } = <HTMLTextAreaElement>event.target;
		clearTimeout(timer);
		if (value === '') {
			searchResults = [];
			return;
		}
		timer = setTimeout(() => {
			isPromiseInProgress = true;
			searchForArtists(value);
		}, debounceDurationInMs);
	};
</script>

<label for="artistNameSearch">
	Search by song or artist:
	<input
		type="text"
		name="artistNameSearch"
		on:keyup={debounceThenSearchForArtists}
		placeholder="Led Zepplin"
		id="artistNameSearch"
		class={cssClasses.textInput}
	/>
</label>
<SearchResults {searchResults} isLoading={isPromiseInProgress} />
