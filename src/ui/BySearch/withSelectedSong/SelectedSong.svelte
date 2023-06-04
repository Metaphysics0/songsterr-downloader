<script lang="ts">
	import FaTimes from 'svelte-icons/fa/FaTimes.svelte';
	import { selectedSongToDownload } from '../../../stores/selectedSong';
	export let selectedSong: ISearchResult;

	function deselectSong(): void {
		selectedSongToDownload.set(undefined);
	}
</script>

<div class="flex items-center bg-slate-100 rounded p-3 shadow-md">
	<div class="mr-auto">
		<p>Song - {selectedSong.title}</p>
		<p class="font-light">Artist - {selectedSong.artist}</p>
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<p class="h-4 cursor-pointer" on:click={deselectSong}>
		<FaTimes />
	</p>
</div>
