<script>
  import Icon from '@iconify/svelte';
  import { amountOfDownloadsAvailable } from '../../../stores/amountOfDownloadsAvailable.store';
  import InfoTooltip from '../common/tooltip/InfoTooltip.svelte';
</script>

<span class="font-light font-italic opacity-60 flex items-center">
  {$amountOfDownloadsAvailable} free download{$amountOfDownloadsAvailable > 1 ||
  $amountOfDownloadsAvailable === 0
    ? 's'
    : ''} remaining
  <InfoTooltip text="test" wrapperClass="ml-2" placement="right">
    <Icon icon="material-symbols:info" />
  </InfoTooltip>
</span>
