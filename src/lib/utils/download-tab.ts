import type {
  MidiDownloadOptions,
  SongsterrPartialMetadata
} from '$lib/types';
import { triggerFileDownload } from '$lib/utils/trigger-client-side-download';
import {
  trackGuitarProDownloaded,
  trackMidiDownloaded,
  trackDownloadFailed
} from '$lib/analytics/mixpanel';
import { toastError } from '$lib/utils/toast.util';
import { ERROR_DOWNLOADING_TAB_TOAST_MESSAGE } from '$lib/constants/error-downloading-tab-toast-message';

export async function downloadGuitarPro(
  song: SongsterrPartialMetadata
): Promise<void> {
  try {
    const data = await post(
      'download/byRevisionJson',
      song
    );
    triggerFileDownload(data);
    trackGuitarProDownloaded({
      title: song.title,
      artist: song.artist,
      songId: song.songId
    });
  } catch (error) {
    console.error('error', error);
    trackDownloadFailed({
      title: song.title,
      artist: song.artist,
      songId: song.songId,
      downloadType: 'gp',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      songsterrUrl: song.byLinkUrl
    });
    toastError(ERROR_DOWNLOADING_TAB_TOAST_MESSAGE);
  }
}

export async function downloadMidi(
  song: SongsterrPartialMetadata,
  options: Partial<MidiDownloadOptions> = {}
): Promise<void> {
  try {
    const data = await post(
      'download/byRevisionJsonMidi',
      song,
      options
    );
    triggerFileDownload(data);
    trackMidiDownloaded({
      title: song.title,
      artist: song.artist,
      songId: song.songId
    });
  } catch (error) {
    console.error('error', error);
    trackDownloadFailed({
      title: song.title,
      artist: song.artist,
      songId: song.songId,
      downloadType: 'midi',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      songsterrUrl: song.byLinkUrl
    });
    toastError(ERROR_DOWNLOADING_TAB_TOAST_MESSAGE);
  }
}

async function post(
  endpoint: string,
  song: SongsterrPartialMetadata,
  options: object = {}
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      songTitle: song.title,
      byLinkUrl: song.byLinkUrl,
      ...options
    })
  });
  if (!response.ok) {
    console.error('Error fetching', {
      url: `/api/${endpoint}`,
      status: response.status
    });
    throw new Error(`Download failed with status ${response.status}`);
  }

  return {
    blob: await response.blob(),
    fileName: getDownloadFileName(response.headers.get('content-disposition'))
  };
}

function getDownloadFileName(contentDisposition: string | null): string {
  if (!contentDisposition) return 'download';

  const encodedName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encodedName) {
    try {
      return decodeURIComponent(encodedName);
    } catch {
      // Fall through to the ASCII filename.
    }
  }

  return contentDisposition.match(/filename="([^"]+)"/i)?.[1] ?? 'download';
}
