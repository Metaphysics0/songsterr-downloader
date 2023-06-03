<script lang="ts">
	import SeachResult from '../ByArtist/SeachResult.svelte';

	export let searchResults: ISearchResult[] = [];
	export let isLoading: boolean;

	let shouldShowLoadingIndicator = isLoading && searchResults.length === 0;
</script>

<dl
	class={`bg-white rounded max-h-lg overflow-scroll ${
		searchResults.length ? 'border' : ''
	}`}
>
	{#if shouldShowLoadingIndicator}
		<p>Loading...</p>
	{/if}
	{#each searchResults as searchResult, index}
		<SeachResult {searchResult} index={index + 1} />
	{/each}
</dl>
