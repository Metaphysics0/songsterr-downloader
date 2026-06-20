<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
  class={className}
>
  <path d="M0 0h24v24H0z" fill="none" />
  <path
    fill="currentColor"
    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5zM8.5 13.5a1.5 1.5 0 0 0-1.5 1.5v3h1v-1h.5a1.5 1.5 0 0 0 0-3zm0 2H8v-1h.5a.5.5 0 0 1 0 1m4.5-2h-1.5v4H13a1.5 1.5 0 0 0 1.5-1.5v-1A1.5 1.5 0 0 0 13 13.5m.5 2.5a.5.5 0 0 1-.5.5h-.5v-2h.5a.5.5 0 0 1 .5.5zm2-2.5v4h1v-1.5h1v-1h-1v-.5h1.5v-1z"
  />
</svg>
