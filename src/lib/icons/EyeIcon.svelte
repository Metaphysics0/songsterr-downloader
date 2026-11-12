<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
  class={className}
  aria-hidden="true"
>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    d="M2.06 12.35a1 1 0 0 1 0-.7a10.75 10.75 0 0 1 19.88 0a1 1 0 0 1 0 .7a10.75 10.75 0 0 1-19.88 0"
  />
  <circle
    cx="12"
    cy="12"
    r="3"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  />
</svg>
