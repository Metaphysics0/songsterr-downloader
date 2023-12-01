import { buildFileNameFromSongName } from '$lib/server/songsterrService';
import { json, type HttpError } from '@sveltejs/kit';
import { GUITAR_PRO_CONTENT_TYPE } from '../../../../consts.js';
import { convertArrayBufferToArray } from '$lib/utils/array.js';
import UploadTabToS3AndMongoService from '$lib/server/services/uploadTabToS3AndMongo.service.js';

export const POST = async ({ request }): Promise<Response | HttpError> => {
  const uploadService = new UploadTabToS3AndMongoService();
  const { source, songTitle, songId, artist, byLinkUrl } = await request.json();
  const existingDownloadLink =
    await uploadService.getS3DownloadLinkBySongsterrSongId(songId);

  const { buffer, contentType } = await downloadAndGetArrayBuffer(
    existingDownloadLink || source
  );
  const fileName = buildFileNameFromSongName(
    songTitle,
    existingDownloadLink || source
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
      songsterrDownloadLink: source
    }
  });

  return json({
    file: convertArrayBufferToArray(buffer),
    fileName,
    contentType
  });
};

async function downloadAndGetArrayBuffer(url: string) {
  const downloadResponse = await fetch(url);
  const buffer = await downloadResponse.arrayBuffer();
  const contentType =
    downloadResponse.headers.get('Content-Type') || GUITAR_PRO_CONTENT_TYPE;

  return { contentType, buffer };
}
