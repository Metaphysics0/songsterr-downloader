import type {
  SongsterrDownloadResponse,
  SongsterrPartialMetadata
} from '$lib/types';
import { triggerFileDownload } from '$lib/utils/trigger-client-side-download';
import { printTab } from '$lib/utils/print-tab';
import {
  trackGuitarProDownloaded,
  trackMidiDownloaded,
  trackPdfDownloaded,
  trackDownloadFailed
} from '$lib/analytics/mixpanel';
import { toastError } from '$lib/utils/toast.util';
import { ERROR_DOWNLOADING_TAB_TOAST_MESSAGE } from '$lib/constants/error-downloading-tab-toast-message';

export async function downloadGuitarPro(
  song: SongsterrPartialMetadata
): Promise<void> {
  return runDownload(song, 'gp', async () => {
    const data = await post<SongsterrDownloadResponse>(
      'download/byRevisionJson',
      song
    );
    triggerFileDownload(data);
    trackGuitarProDownloaded({
      title: song.title,
      artist: song.artist,
      songId: song.songId
    });
  });
}

export async function downloadMidi(
  song: SongsterrPartialMetadata
): Promise<void> {
  return runDownload(song, 'midi', async () => {
    const data = await post<SongsterrDownloadResponse>(
      'download/byRevisionJsonMidi',
      song
    );
    triggerFileDownload(data);
    trackMidiDownloaded({
      title: song.title,
      artist: song.artist,
      songId: song.songId
    });
  });
}

export async function downloadPdf(
  song: SongsterrPartialMetadata
): Promise<void> {
  return runDownload(song, 'pdf', async () => {
    // Reuse the Guitar Pro bytes and render them to a printable PDF client-side.
    const data = await post<SongsterrDownloadResponse>(
      'download/byRevisionJson',
      song
    );
    await printTab(data.file);
    trackPdfDownloaded({
      title: song.title,
      artist: song.artist,
      songId: song.songId
    });
  });
}

async function runDownload(
  song: SongsterrPartialMetadata,
  downloadType: string,
  action: () => Promise<void>
): Promise<void> {
  try {
    await action();
  } catch (error) {
    console.error('error', error);
    trackDownloadFailed({
      title: song.title,
      artist: song.artist,
      songId: song.songId,
      downloadType,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    toastError(ERROR_DOWNLOADING_TAB_TOAST_MESSAGE);
  }
}

async function post<T>(
  endpoint: string,
  song: SongsterrPartialMetadata
): Promise<T> {
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ songTitle: song.title, byLinkUrl: song.byLinkUrl })
  });
  if (!response.ok) {
    console.error('Error fetching', {
      url: `/api/${endpoint}`,
      status: response.status
    });
    throw new Error();
  }
  return response.json() as Promise<T>;
}
