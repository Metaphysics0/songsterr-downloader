import { browser } from '$app/environment';

const REVOKE_DELAY_MS = 60_000;

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
    link.rel = 'noopener';

    /*
     * Firefox only honours a programmatic click on an anchor that is in the
     * document, so the link is attached for the click and removed after.
     */
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();

    /*
     * Revoking immediately can cancel the download before the browser has
     * finished reading the blob (Safari in particular). The URL is scoped to
     * this document, so holding it briefly costs nothing.
     */
    window.setTimeout(
      () => window.URL.revokeObjectURL(objectUrl),
      REVOKE_DELAY_MS
    );
  } catch (error) {
    console.error('Error triggering download', error);
  }
}
