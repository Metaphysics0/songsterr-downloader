<script lang="ts">


  interface Props {
    innerText: string;
    href: string;
    linkColor?: 'primary' | 'secondary';
    target?: string;
    cssClass?: string;
  }

  let {
    innerText,
    href,
    linkColor = 'primary',
    target = '_blank',
    cssClass = ''
  }: Props = $props();

  const linkColorClass = {
    primary: 'text-blue-400 hover:text-blue-500 ease',
    secondary: 'text-amber-500 hover:text-amber-600 ease'
  }[linkColor];
</script>

<a {href} {target} rel="noreferrer" class={linkColorClass + ' ' + cssClass}
  >{innerText}</a
>
