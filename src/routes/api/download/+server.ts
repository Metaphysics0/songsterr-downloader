import { error, json, type HttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  buildFileNameFromSongName,
  getDownloadLinkFromSongId
} from '$lib/server/songsterrService';
import { BULK_DOWNLOAD_SECRET } from '$env/static/private';
import { BulkDownloadService } from '$lib/server/bulkDownloadService';
import { normalize } from '$lib/utils/string';

export const GET = (async ({ url }): Promise<Response> => {
  const songId = url.searchParams.get('songId');
  const songTitle = url.searchParams.get('songTitle') as string;
  const byLinkUrl = url.searchParams.get('byLinkUrl');
  if (!songId) throw 'Unable to find the song id from the URL';

  const downloadLink = await getDownloadLinkFromSongId(songId, byLinkUrl);

  if (!downloadLink) throw 'Unable to find download link';

  const downloadResponse = await fetch(downloadLink);
  const buf = await downloadResponse.arrayBuffer();

  return json({
    downloadLink,
    file: Array.from(new Uint8Array(buf)),
    fileName: buildFileNameFromSongName(songTitle, downloadLink),
    contentType:
      downloadResponse.headers.get('Content-Type') || 'application/gp'
  });
}) satisfies RequestHandler;

export const POST = async ({ request }): Promise<Response | HttpError> => {
  const { artistId, secretAccessCode, artistName } = await request.json();

  if (!artistId) {
    return error(500, {
      message: 'Param missing: artistId'
    });
  }

  if (secretAccessCode !== BULK_DOWNLOAD_SECRET) {
    return error(500, {
      message: 'invalid code!'
    });
  }

  try {
    console.log(`Starting bulk download for artistId: ${artistId} ...`);
    const startTime = Date.now();

    const { getZipFileOfAllTabs } = new BulkDownloadService(artistId);
    const zip = await getZipFileOfAllTabs();

    const endTime = Date.now();
    const executionTimeInMs = endTime - startTime;

    console.log(`Execution time: ${executionTimeInMs} ms`);

    return json({
      file: Array.from(new Uint8Array(zip.toBuffer())),
      fileName: `${normalize(artistName)}-tabs`,
      contentType: 'application/zip'
    });
  } catch (e) {
    console.error('BULK UPLOAD FAILURE:', e);
    return error(500, {
      message: "Bulk upload failed, contact me and I'll resolve it immediately"
    });
  }
};
