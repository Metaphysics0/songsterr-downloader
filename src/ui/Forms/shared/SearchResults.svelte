<script lang="ts">
	import { fade } from 'svelte/transition';
	import SeachResult from '../ByArtist/SeachResult.svelte';

	export let searchResults: ISearchResult[] = [];
	export let isLoading: boolean;
</script>

<!-- <div class="mb-1">
	{#if isLoading}
		<p>Loading!!</p>
	{:else if searchResults.length}
		<p>2. Select a song from the artist:</p>
	{/if}
</div> -->

<div
	class={`bg-white rounded max-h-lg overflow-scroll ${
		searchResults.length ? 'border' : ''
	}`}
	transition:fade
>
	{#each searchResults as searchResult, index}
		<SeachResult {searchResult} index={index + 1} />
	{/each}
</div>
