import type { MidiDownloadOptions, SelectedSong } from '$lib/types';
import { triggerFileDownload } from '$lib/utils/trigger-client-side-download';
import {
  trackGuitarProDownloaded,
  trackMidiDownloaded,
  trackDownloadFailed
} from '$lib/analytics/mixpanel';
import { toastError } from '$lib/utils/toast.util';
import { ERROR_DOWNLOADING_TAB_TOAST_MESSAGE } from '$lib/constants/error-downloading-tab-toast-message';
import { fetchAllPartRevisionsWithFallback } from '$lib/songsterr/revision-fetcher';
import { buildFileNameFromSongName } from '$lib/songsterr/file-name';

/*
 * Downloads run entirely in the browser: part payloads come straight from
 * Songsterr's CDN and are converted locally with alphaTab. The server never
 * contacts Songsterr for a download, so Songsterr blocking datacenter IPs
 * does not affect it.
 */

export async function downloadGuitarPro(song: SelectedSong): Promise<void> {
  try {
    const blob = await buildFile(song, 'gp');
    triggerFileDownload({
      blob,
      fileName: buildFileNameFromSongName(song.title, '.gp')
    });
    trackGuitarProDownloaded({
      title: song.title,
      artist: song.artist,
      songId: song.songId,
      source: song.source
    });
  } catch (error) {
    handleDownloadError(song, 'gp', error);
  }
}

export async function downloadMidi(
  song: SelectedSong,
  options: Partial<MidiDownloadOptions> = {}
): Promise<void> {
  try {
    const blob = await buildFile(song, 'midi', options);
    triggerFileDownload({
      blob,
      fileName: buildFileNameFromSongName(song.title, '.mid')
    });
    trackMidiDownloaded({
      title: song.title,
      artist: song.artist,
      songId: song.songId,
      source: song.source
    });
  } catch (error) {
    handleDownloadError(song, 'midi', error);
  }
}

async function buildFile(
  song: SelectedSong,
  format: 'gp' | 'midi',
  options: Partial<MidiDownloadOptions> = {}
): Promise<Blob> {
  // alphaTab is large; load it only once someone actually downloads.
  const [
    { revisions, warnings: fetchWarnings },
    { SongsterrToAlphaTabConverter }
  ] = await Promise.all([
    fetchAllPartRevisionsWithFallback(song),
    import('$lib/converter/songsterr-to-alphatab.converter')
  ]);

  if (revisions.length === 0) {
    console.error('No revision payloads fetched', fetchWarnings);
    throw new Error(`Unable to fetch any tracks for songId ${song.songId}`);
  }

  const converter = new SongsterrToAlphaTabConverter();
  const input = { meta: song, revisions };
  const { data, warnings: convertWarnings } =
    format === 'gp'
      ? converter.toGp7(input)
      : converter.toMidi(input, {
          separateTracks: options.separateTracks === true
        });

  const warnings = [...fetchWarnings, ...convertWarnings];
  if (warnings.length > 0) {
    console.warn(
      `Songsterr to ${format} conversion warnings`,
      warnings.slice(0, 20)
    );
  }

  return new Blob([data as Uint8Array<ArrayBuffer>], {
    type: format === 'gp' ? 'application/gp' : 'audio/midi'
  });
}

function handleDownloadError(
  song: SelectedSong,
  downloadType: 'gp' | 'midi',
  error: unknown
) {
  console.error('error', error);
  trackDownloadFailed({
    title: song.title,
    artist: song.artist,
    songId: song.songId,
    source: song.source,
    downloadType,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    songsterrUrl: song.byLinkUrl
  });
  toastError(ERROR_DOWNLOADING_TAB_TOAST_MESSAGE);
}
