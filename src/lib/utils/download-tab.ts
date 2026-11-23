import type {
  DownloadType,
  MidiDownloadOptions,
  MpakDownloadOptions,
  SelectedSong
} from '$lib/types';
import { triggerFileDownload } from '$lib/utils/trigger-client-side-download';
import {
  trackGuitarProDownloaded,
  trackMidiDownloaded,
  trackMpakDownloaded,
  trackDownloadFailed
} from '$lib/analytics/mixpanel';
import { toastError } from '$lib/utils/toast.util';
import { ERROR_DOWNLOADING_TAB_TOAST_MESSAGE } from '$lib/constants/error-downloading-tab-toast-message';
import { fetchAllPartRevisionsWithFallback } from '$lib/songsterr/revision-fetcher';
import { MPAK_MEDIA_TYPE } from '$lib/mpak/build-mpak';
import { buildFileNameFromSongName } from '$lib/songsterr/file-name';

/*
 * Downloads run entirely in the browser: part payloads come straight from
 * Songsterr's CDN and are converted locally with alphaTab. The server never
 * contacts Songsterr for a download, so Songsterr blocking datacenter IPs
 * does not affect it.
 */

/** Resolves to true when the file was saved, false when the download failed. */
export async function downloadGuitarPro(song: SelectedSong): Promise<boolean> {
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
    return true;
  } catch (error) {
    handleDownloadError(song, 'gp', error);
    return false;
  }
}

export async function downloadMidi(
  song: SelectedSong,
  options: Partial<MidiDownloadOptions> = {}
): Promise<boolean> {
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
    return true;
  } catch (error) {
    handleDownloadError(song, 'midi', error);
    return false;
  }
}

export async function downloadMpak(
  song: SelectedSong,
  options: Partial<MpakDownloadOptions> = {}
): Promise<boolean> {
  try {
    const blob = await buildFile(song, 'mpak', options);
    triggerFileDownload({
      blob,
      fileName: buildFileNameFromSongName(song.title, '.mpak')
    });
    trackMpakDownloaded({
      title: song.title,
      artist: song.artist,
      songId: song.songId,
      source: song.source
    });
    return true;
  } catch (error) {
    handleDownloadError(song, 'mpak', error);
    return false;
  }
}

async function buildFile(
  song: SelectedSong,
  format: DownloadType,
  options: Partial<MidiDownloadOptions & MpakDownloadOptions> = {}
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
    format === 'gp' || format === 'mpak'
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

  if (format === 'mpak') {
    const { buildMpakForSong } = await import('$lib/mpak/song-to-mpak');
    const mpak = await buildMpakForSong({
      song,
      tab: data,
      allVideos: options.allVideos === true
    });
    if (mpak.skipped.length > 0) {
      console.warn('Videos left without sync points', mpak.skipped);
    }
    return new Blob([mpak.bytes as Uint8Array<ArrayBuffer>], {
      type: MPAK_MEDIA_TYPE
    });
  }

  return new Blob([data as Uint8Array<ArrayBuffer>], {
    type: format === 'gp' ? 'application/gp' : 'audio/midi'
  });
}

function handleDownloadError(
  song: SelectedSong,
  downloadType: DownloadType,
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
