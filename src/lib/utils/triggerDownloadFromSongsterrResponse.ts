import { browser } from '$app/environment';

export function triggerFileDownloadFromSongsterrResponse(
  res: SongsterrDownloadResponse
): void {
  if (!browser) return;
  if (res.errors?.length) {
    // handle error here with a toast or something
    // toast
  }

  try {
    const uint8Array = new Uint8Array(res.file);
    const blob = new Blob([uint8Array], { type: res.contentType });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = res.fileName;
    link.click();
  } catch (error) {
    console.error('Error triggering download', error);
  }
}
