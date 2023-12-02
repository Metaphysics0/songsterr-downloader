<script lang="ts">
  export let innerText: string;
  export let href: string;

  export let linkColor: 'primary' | 'secondary' = 'primary';

  const linkColorClass = {
    primary: 'text-blue-400 hover:text-blue-500 ease',
    secondary: 'text-amber-500 hover:text-amber-600 ease'
  }[linkColor];
</script>

<a {href} target="_blank" rel="noreferrer" class={linkColorClass}>{innerText}</a
>
