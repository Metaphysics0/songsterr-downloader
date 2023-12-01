import { error, json, type HttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  buildFileNameFromSongName,
  getDownloadLinkFromSongId
} from '$lib/server/songsterrService';
import { BULK_DOWNLOAD_SECRET } from '$env/static/private';
import { BulkDownloadService } from '$lib/server/bulkDownloadService';
import { normalize } from '$lib/utils/string';
import { convertArrayBufferToArray } from '$lib/utils/array';
import UploadTabToS3AndMongoService from '$lib/server/services/uploadTabToS3AndMongo.service';

/* by search result */
export const PUT = (async ({ request }): Promise<Response> => {
  const uploadService = new UploadTabToS3AndMongoService();
  const { songId, songTitle, byLinkUrl, artist } = await request.json();
  if (!songId) throw 'Unable to find the song id from the params';

  const existingDownloadLink =
    await uploadService.getS3DownloadLinkBySongsterrSongId(songId);

  const link =
    existingDownloadLink ||
    (await getDownloadLinkFromSongId(songId, { byLinkUrl }));

  if (!link && !existingDownloadLink) throw 'Unable to find download link';

  const downloadResponse = await fetch(existingDownloadLink || link);
  const buffer = await downloadResponse.arrayBuffer();
  const fileName = buildFileNameFromSongName(
    songTitle,
    existingDownloadLink || link
  );

  await uploadService.call({
    s3Data: {
      fileName,
      data: Buffer.from(buffer),
      artist
    },
    mongoData: {
      songTitle,
      artist,
      songsterrSongId: String(songId),
      songsterrOriginUrl: byLinkUrl,
      songsterrDownloadLink: link
    }
  });

  return json({
    file: convertArrayBufferToArray(buffer),
    fileName,
    contentType:
      downloadResponse.headers.get('Content-Type') || 'application/gp'
  });
}) satisfies RequestHandler;

/* bulk download */
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

    const zip = await new BulkDownloadService(artistId).getZipFileOfAllTabs();

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
