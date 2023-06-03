<script lang="ts">
	import { apiService } from '$lib/apiService';
	import { cssClasses } from '$lib/sharedCssClasses';
	import { selectedSongToDownload } from '../../stores/activeTabMenu';
	import SearchResults from './BySearch/withoutSelectedSong/SearchResults.svelte';
	import SelectedSong from './BySearch/withSelectedSong/SelectedSong.svelte';

	let selectedSong: ISearchResult | undefined;
	selectedSongToDownload.subscribe((value) => {
		selectedSong = value;
	});

	let searchResults: ISearchResult[] = [];
	async function searchForArtists(inputText: string): Promise<void> {
		try {
			const response = await apiService.artists.search(inputText);
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

{#if selectedSong}
	<div class="flex flex-col items-center">
		<div class="mb-8 w-full">
			<SelectedSong {selectedSong} />
		</div>
		<button class={cssClasses.downloadBtn}
			>Download {selectedSong.title} Tab</button
		>
		<strong class="my-2">Or</strong>
		<button
			class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-amber hover:bg-amber-300"
			>Download All Tabs from {selectedSong.artist}</button
		>
	</div>
{:else}
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
{/if}
