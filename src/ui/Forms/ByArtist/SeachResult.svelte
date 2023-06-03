<script lang="ts">
	import { selectedSongToDownload } from '../../../stores/activeTabMenu';

	export let searchResult: ISearchResult;
	export let index: number = 0;

	function selectSongToDownload(): void {
		selectedSongToDownload.set(searchResult);
	}
</script>

<dt
	class="p-2 flex items-center border-b-1 cursor-pointer hover:bg-gray-50 transition"
	on:click={selectSongToDownload}
	on:keydown={({ key }) => console.log('key pressed:', key)}
>
	{#if index !== 0}
		<span class="mr-3">
			{index}.
		</span>
	{/if}
	<div>
		<p>{searchResult.title}</p>
		<p class="font-light">{searchResult.artist}</p>
	</div>
</dt>
