import type { SongsterrDownloadResponse, SongsterrPartialMetadata } from '$lib/types';
import { triggerFileDownload } from '$lib/utils/trigger-client-side-download';
import { trackGuitarProDownloaded, trackMidiDownloaded } from '$lib/analytics/mixpanel';
import { toastError } from '$lib/utils/toast.util';
import { ERROR_DOWNLOADING_TAB_TOAST_MESSAGE } from '$lib/constants/error-downloading-tab-toast-message';

export async function downloadGuitarPro(song: SongsterrPartialMetadata): Promise<void> {
  try {
    const data = await post<SongsterrDownloadResponse>('download/byRevisionJson', song);
    triggerFileDownload(data);
    trackGuitarProDownloaded({ title: song.title, artist: song.artist, songId: song.songId });
  } catch (error) {
    console.error('error', error);
    toastError(ERROR_DOWNLOADING_TAB_TOAST_MESSAGE);
  }
}

export async function downloadMidi(song: SongsterrPartialMetadata): Promise<void> {
  try {
    const data = await post<SongsterrDownloadResponse>('download/byRevisionJsonMidi', song);
    triggerFileDownload(data);
    trackMidiDownloaded({ title: song.title, artist: song.artist, songId: song.songId });
  } catch (error) {
    console.error('error', error);
    toastError(ERROR_DOWNLOADING_TAB_TOAST_MESSAGE);
  }
}

async function post<T>(endpoint: string, song: SongsterrPartialMetadata): Promise<T> {
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ songTitle: song.title, byLinkUrl: song.byLinkUrl })
  });
  if (!response.ok) {
    console.error('Error fetching', { url: `/api/${endpoint}`, status: response.status });
    throw new Error();
  }
  return response.json() as Promise<T>;
}
