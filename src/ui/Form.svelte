<script lang="ts">
	import { enhance } from '$app/forms';
	import { SONGSTERR_URL_REGEX_PATTERN } from '../consts';

	function triggerLinkDownload(generatedUrl: string): void {
		if (!/\.gp/.test(generatedUrl)) {
			alert('There was a problem getting the file from this url ):');
		}
		const link = document.createElement('a');
		link.href = generatedUrl;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function setValidationMessage(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.value === '') {
			input.setCustomValidity('Please enter a Songsterr URL.');
		} else {
			input.setCustomValidity('Please enter a valid Songsterr URL.');
		}
	}
</script>

<form
	class="flex flex-col items-center"
	method="POST"
	action="?/getDownloadLink"
	use:enhance={() => {
		return async ({ result, update }) => {
			update({ reset: false });
			// @ts-ignore
			triggerLinkDownload(result.data);
		};
	}}
>
	<input
		type="url"
		name="url"
		pattern={SONGSTERR_URL_REGEX_PATTERN}
		required
		on:invalid={setValidationMessage}
		placeholder="https://www.songsterr.com/a/wsa/structures-hydroplaning-tab-s88503"
		class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2 w-xl text-center"
	/>
	<button
		class="w-fit px-2 py-1 bg-red-500 hover:bg-red-400 text-white font-semibold p-2 rounded-lg shadow-md mr-3 transition duration-75 cursor-pointer"
		>Download Guitar Pro File!</button
	>
</form>
