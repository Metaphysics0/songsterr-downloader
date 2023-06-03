<script lang="ts">
	import { apiService } from '$lib/apiService';
	import { cssClasses } from '$lib/sharedCssClasses';
	import SelectedSong from './SelectedSong.svelte';

	export let selectedSong: ISearchResult;

	async function downloadTabFromSearchResult(): Promise<void> {
		const { songId, hasPlayer } = selectedSong;
		if (!hasPlayer) {
			window.alert(
				'This song does is not a guitar pro tab, and is just raw text'
			);
			return;
		}

		const download = await apiService.download.bySongId(String(songId));
	}
</script>

<div class="flex flex-col items-center">
	<div class="mb-8 w-full">
		<SelectedSong {selectedSong} />
	</div>
	<button class={cssClasses.downloadBtn} on:click={downloadTabFromSearchResult}
		>Download {selectedSong.title} Tab</button
	>
	<strong class="my-2">Or</strong>
	<button
		class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-amber hover:bg-amber-300"
		>Download All Tabs from {selectedSong.artist}</button
	>
</div>
