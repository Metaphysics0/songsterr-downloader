import { jsonWithCors } from '$lib/server/cors';
import prisma from '$lib/server/prisma';
import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import { storeDownloadedSongToUser } from '$lib/server/services/user/user.service';
import { logger } from '$lib/utils/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  const service = new DownloadTabService(
    // ts-ignoring here because the downloadType param matcher already ensures this
    // @ts-ignore
    params.downloadType
  );

  logger.info(
    `POST api/download - Starting download with: ${JSON.stringify(params)}`
  );

  const { songId, ...response } = await service.download(request);
  const ipAddress = request.headers.get('x-forwarded-for');

  if (ipAddress && songId) {
    logger.info(
      `POST api/download - Storing downloaded song to ip: ${ipAddress}`
    );
    await storeDownloadedSongToUser({
      ipAddress,
      songsterrSongId: songId
    });
  }

  return jsonWithCors(request, response);
}) satisfies RequestHandler;
