<script lang="ts">
	import { apiService } from '$lib/apiService';
	import mockSearchResultResponse from '$lib/mockSearchResultResponse';
	import { cssClasses } from '$lib/sharedCssClasses';
	import SearchResults from './shared/SearchResults.svelte';

	let searchResults: ISearchResult[] = [];
	async function searchForArtists(inputText: string): Promise<void> {
		try {
			// const response = await apiService.artists.search(inputText);
			// const data = await response.json();
			// console.log('DATA', data);

			// @ts-ignore
			searchResults = Array(10).fill(mockSearchResultResponse);
			// searchRe
			// searchResults = data.searchResults;
		} catch (error) {
			console.log('error fetching search results', error);
		} finally {
			isPromiseInProgress = false;
		}
	}

	const debounceDurationInMs = 750;
	let timer: any;
	let isPromiseInProgress: boolean = false;
	const debounceThenSearchForArtists = (event: Event) => {
		const { value } = <HTMLTextAreaElement>event.target;
		clearTimeout(timer);
		timer = setTimeout(() => {
			isPromiseInProgress = true;
			searchForArtists(value);
		}, debounceDurationInMs);
	};
</script>

<label for="artistNameSearch">
	1. Search by song or artist
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
