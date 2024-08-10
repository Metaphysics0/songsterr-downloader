<script lang="ts">
  import Icon from '@iconify/svelte';

  export let value: string = '';
  export let wrapperClass: string = '';
  export let id: string = '';

  function onInput(e: any) {
    value = e.target.value;
  }
</script>

<div class="w-max flex {wrapperClass}">
  <div class="relative w-full">
    <div
      class="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none"
    >
      <Icon icon="ic:outline-email" />
    </div>
    <input
      type="email"
      name="email"
      {id}
      class="block p-2.5 w-full z-20 ps-10 pe-5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-e-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 font-bold"
      placeholder="email@address.com"
      on:input={onInput}
      required
    />
  </div>
</div>
