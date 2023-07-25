import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  buildFileNameFromSongName,
  getDownloadLinkFromSongId
} from '$lib/server/songsterrService';

export const GET = (async ({ url }): Promise<Response> => {
  const songId = url.searchParams.get('songId');
  const songTitle = url.searchParams.get('songTitle') as string;
  if (!songId) throw 'Unable to find the song id from the URL';

  const link = await getDownloadLinkFromSongId(songId, url);

  if (!link) throw 'Unable to find download link';

  const downloadResponse = await fetch(link);
  const buf = await downloadResponse.arrayBuffer();

  return json({
    file: Array.from(new Uint8Array(buf)),
    fileName: buildFileNameFromSongName(songTitle, link),
    contentType:
      downloadResponse.headers.get('Content-Type') || 'application/gp'
  });
}) satisfies RequestHandler;
