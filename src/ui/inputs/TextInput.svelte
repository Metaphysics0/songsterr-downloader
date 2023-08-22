<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: string;
  export let label: string;

  interface $$Props extends HTMLInputAttributes {
    label: string;
    name: string;
  }
  console.log('REST PROPS', $$props);
</script>

<label for={name}>
  {label}
  <input
    {...$$restProps}
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2 text-center"
  />
</label>
