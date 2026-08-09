import { browser } from '$app/environment';

export function triggerFileDownload({
  blob,
  fileName
}: {
  blob: Blob;
  fileName: string;
}) {
  if (!browser) return;
  try {
    const link = document.createElement('a');
    const objectUrl = window.URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
  } catch (error) {
    console.error('Error triggering download', error);
  }
}
