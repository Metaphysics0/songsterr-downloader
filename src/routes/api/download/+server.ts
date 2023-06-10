import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  buildFileNameFromSongName,
  downloadSongFromSongId,
  getDownloadLinkFromSongId
} from '$lib/server/songsterrService';
import { searchForSongsAndArtists } from '$lib/server/getArtists';

/* Single download */
export const GET = (async ({ url }): Promise<Response> => {
  const songId = url.searchParams.get('songId');
  const songTitle = url.searchParams.get('songTitle') as string;
  if (!songId) throw 'Unable to find the song id from the URL';

  try {
    const { buffer, downloadLink, contentType } = await downloadSongFromSongId(
      songId
    );

    return json({
      file: Array.from(new Uint8Array(buffer)),
      fileName: buildFileNameFromSongName(songTitle, downloadLink),
      contentType: contentType
    });
  } catch (error) {
    return json({
      file: null,
      fileName: '',
      contentType: '',
      error
    });
  }
}) satisfies RequestHandler;

/* Bulk download */
export const POST = (async ({ request }): Promise<Response> => {
  const { artist } = await request.json();
  if (!artist) throw 'Unable to find the songs from the artist';

  const searchResults = await searchForSongsAndArtists(artist);
  const potentialSongsToDownload = searchResults.filter(
    (result) => result.artist === artist && result.hasPlayer
  );

  const songIds = potentialSongsToDownload.map((song) => song.songId);

  return json({
    foo: 'bar'
  });
}) satisfies RequestHandler;
