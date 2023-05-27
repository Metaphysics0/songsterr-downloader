<script lang="ts">
	export let pattern: string | undefined = '';
	export let type: HTMLInputElement['type'] = 'text';
	export let name: string;
</script>

<!-- on:invalid={setValidationMessage}
on:input={clearValidationMessage} -->
<input
	{type}
	{name}
	{pattern}
	required
	placeholder="https://www.songsterr.com/a/wsa/structures-hydroplaning-tab-s88503"
	class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2 w-xl lg:w-lg md:w-sm sm:w-sm text-center"
/>
