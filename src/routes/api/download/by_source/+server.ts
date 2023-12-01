import { buildFileNameFromSongName } from '$lib/server/songsterrService';
import { json, type HttpError } from '@sveltejs/kit';
import { GUITAR_PRO_CONTENT_TYPE } from '../../../../consts.js';
import { convertArrayBufferToArray } from '$lib/utils/array.js';
import UploadTabToS3AndMongoService from '$lib/server/services/uploadTabToS3AndMongo.service.js';
import { DownloadLinkRepository } from '$lib/server/repositories/downloadLink.repository.js';

export const POST = async ({ request }): Promise<Response | HttpError> => {
  const uploadService = new UploadTabToS3AndMongoService();
  const { source, songTitle, songId, artist } = await request.json();
  const existingDownloadLink =
    await uploadService.getS3DownloadLinkBySongsterrSongId(songId);

  const { buffer, contentType } = await downloadAndGetArrayBuffer(
    existingDownloadLink || source
  );
  const fileName = buildFileNameFromSongName(songTitle, source);

  await uploadService.call({
    artist,
    data: Buffer.from(buffer),
    fileName,
    songsterrSongId: String(songId),
    songsterrDownloadLink: source
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
