<script lang="ts">
	import { selectedSongToDownload } from '../../stores/selectedSong';
	import SearchForm from './withoutSelectedSong/SearchForm.svelte';
	import SelectedForm from './withSelectedSong/SelectedForm.svelte';

	let selectedSong: ISearchResult | undefined;
	selectedSongToDownload.subscribe((value) => {
		selectedSong = value;
	});
</script>

{#if selectedSong}
	<SelectedForm {selectedSong} />
{:else}
	<SearchForm />
{/if}
