import { toast } from '@zerodevx/svelte-toast';

export function toastError(message: string) {
  toast.push(message, {
    theme: {
      '--toastBarHeight': 0,
      '--toastBackground': '#ef4444',
      '--toastBarBackground': '#7f1d1d'
    }
  });
}
