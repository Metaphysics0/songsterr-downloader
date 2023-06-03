<script lang="ts">
	import { enhance } from '$app/forms';
	import { cssClasses } from '$lib/sharedCssClasses';
	import { SONGSTERR_URL_REGEX_PATTERN } from '../../../consts';
	import {
		setValidationMessage,
		clearValidationMessage
	} from '../../../utils/inputUtils';

	function triggerLinkDownload(
		res: SongsterrDownloadResponse | undefined
	): void {
		if (!res) {
			alert('Unable to download the Guitar pro link from this URL ):');
			return;
		}

		const uint8Array = new Uint8Array(res.file);
		const blob = new Blob([uint8Array], { type: res.contentType });

		const link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = res.fileName;
		link.click();
	}
</script>

<form
	class="flex flex-col items-center"
	method="POST"
	action="?/getFileResource"
	use:enhance={() => {
		return async ({ result, update }) => {
			update({ reset: false });
			// @ts-ignore
			triggerLinkDownload(result?.data);
		};
	}}
>
	<label for="url" class="w-full">
		Enter in a Songsterr tab url:
		<input
			type="url"
			name="url"
			pattern={SONGSTERR_URL_REGEX_PATTERN.source}
			required
			on:invalid={setValidationMessage}
			on:input={clearValidationMessage}
			placeholder="https://www.songsterr.com/a/wsa/structures-hydroplaning-tab-s88503"
			class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2 text-center"
		/>
	</label>
	<button
		class="w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-red-500 hover:bg-red-400 text-white"
		>Download Tab!</button
	>
</form>

<style>
	@media only screen and (max-width: 600px) {
		input {
			width: calc(100% - 3rem);
		}
	}
</style>
