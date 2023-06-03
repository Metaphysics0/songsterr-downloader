<script lang="ts">
	export let searchResult: ISearchResult;
	export let index: number = 0;
</script>

<dt
	class="p-2 flex items-center border-b-1 cursor-pointer hover:bg-gray-50 transition"
>
	<span class="mr-3">
		{index}.
	</span>
	<div>
		<p>{searchResult.title}</p>
		<p class="font-light">{searchResult.artist}</p>
	</div>
</dt>
