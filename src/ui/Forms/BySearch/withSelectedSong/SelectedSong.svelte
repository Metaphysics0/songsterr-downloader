<script lang="ts">
	import FaTimes from 'svelte-icons/fa/FaTimes.svelte';
	import { selectedSongToDownload } from '../../../../stores/activeTabMenu';
	export let selectedSong: ISearchResult;

	function deselectSong(): void {
		selectedSongToDownload.set(undefined);
	}
</script>

<div class="flex items-center">
	<div class="mr-auto">
		<p>Song - {selectedSong.title}</p>
		<p class="font-light">Artist - {selectedSong.artist}</p>
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<p class="h-4 cursor-pointer" on:click={deselectSong}>
		<FaTimes />
	</p>
</div>
