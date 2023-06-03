<script lang="ts">
	import {
		Tab,
		TabGroup,
		TabList,
		TabPanel,
		TabPanels
	} from '@rgossiaux/svelte-headlessui';
	import { createClassNames, tabs } from './shared';
	import {
		activeTabMenuIndex,
		type ITabMenuIndex
	} from '../../stores/activeTabMenu';

	function setActiveTabIndex(idx: ITabMenuIndex): void {
		activeTabMenuIndex.set(idx);
	}
</script>

<div>
	<TabGroup
		class="flex flex-col max-w-md w-full mx-auto mt-2"
		as="div"
		on:change={(e) => setActiveTabIndex(e.detail)}
	>
		<TabList
			class="relative z-0 rounded-lg shadow flex divide-x divide-gray-200 mb-2"
		>
			{#each tabs as tab, tabIdx (tab.name)}
				<Tab
					class={({ selected }) =>
						createClassNames(
							selected ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
							tabIdx === 0 ? 'rounded-l-lg' : '',
							tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
							'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
						)}
					let:selected
				>
					<span>
						{tab.name}
					</span>
					<span
						aria-hidden="true"
						class={createClassNames(
							selected ? 'bg-slate-500' : 'bg-transparent',
							'absolute inset-x-0 bottom-0 h-0.5'
						)}
					/>
				</Tab>
			{/each}
		</TabList>

		<TabPanels class="mt-4">
			{#each tabs as tab (tab.name)}
				<TabPanel>
					<svelte:component this={tab.content} />
				</TabPanel>
			{/each}
		</TabPanels>
	</TabGroup>
</div>
