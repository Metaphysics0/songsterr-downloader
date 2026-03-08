import { browser } from '$app/environment';

export function triggerFileDownload({
  file,
  contentType,
  fileName
}: {
  file: number[];
  contentType: string;
  fileName: string;
}) {
  if (!browser) return;
  try {
    const uint8Array = new Uint8Array(file);
    const blob = new Blob([uint8Array], { type: contentType });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  } catch (error) {
    console.error('Error triggering download', error);
  }
}
