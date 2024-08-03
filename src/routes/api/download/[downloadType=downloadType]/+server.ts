import { jsonWithCors } from '$lib/server/cors';
import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import { storeDownloadedSongToUser } from '$lib/server/services/user/user.service';
import { MaximumAmountOfDownloadsExceededError } from '$lib/server/utils/errors/errors.util';
import { DownloadTabType } from '$lib/types/downloadType';
import { logger } from '$lib/utils/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params, ...event }) => {
  try {
    const service = new DownloadTabService(
      params.downloadType as DownloadTabType
    );

    const { songId, ...response } = await service.download(request);
    const ipAddress = event.getClientAddress();

    if (ipAddress && songId) {
      await storeDownloadedSongToUser({ ipAddress, songsterrSongId: songId });
    }

    return jsonWithCors(request, response);
  } catch (error) {
    if (error instanceof MaximumAmountOfDownloadsExceededError) {
      return json({ errors: [error.message] });
    }

    logger.error(
      `POST /download/${params.downloadType} -  Unknown download failure`,
      error
    );
    return json({ errors: ['Unknown error'] });
  }
}) satisfies RequestHandler;
