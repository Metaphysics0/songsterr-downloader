import { jsonWithCors } from '$lib/server/cors';
import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import { storeDownloadedSongToUser } from '$lib/server/services/user/user.service';
import { DownloadTabType } from '$lib/types/downloadType';
import { logger } from '$lib/utils/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params, ...event }) => {
  logger.info(
    `POST api/download - Starting download with: ${JSON.stringify(params)}`
  );
  const service = new DownloadTabService(
    params.downloadType as DownloadTabType
  );

  const { songId, ...response } = await service.download(request);
  const ipAddress = event.getClientAddress();

  if (ipAddress && songId) {
    await storeDownloadedSongToUser({ ipAddress, songsterrSongId: songId });
  }

  return jsonWithCors(request, response);
}) satisfies RequestHandler;
