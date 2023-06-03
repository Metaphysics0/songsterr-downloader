<script lang="ts">
	import {
		activeTabMenuIndex,
		type ITabMenuIndex
	} from '../stores/activeTabMenu';

	const headerTextMap: Record<ITabMenuIndex, string> = {
		0: 'Enter in a link',
		1: 'Search all available tabs'
	};

	let headerText = headerTextMap[0];

	activeTabMenuIndex.subscribe((val) => {
		console.log('TAB MENU INDEX', val);
		headerText = headerTextMap[val];
	});
</script>

<div class="flex flex-col items-center text-center mb-4 font-sans">
	<h1 class="text-4xl mb-2 mx-a font-bold">Songsterr to GPX 🎸</h1>
	<p>
		{headerText} from
		<a
			href="https://songsterr.com"
			target="_blank"
			rel="noreferrer"
			class="text-blue-400">songsterr</a
		>
		and click the button to get a
		<a
			href="https://www.guitar-pro.com/"
			target="_blank"
			rel="noreferrer"
			class="text-blue-400"
			>Guitar Pro
		</a>
		file!
	</p>
</div>
