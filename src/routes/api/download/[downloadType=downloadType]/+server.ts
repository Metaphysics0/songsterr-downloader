import { jsonWithCors } from '$lib/server/cors';
import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import type { DownloadTabType } from '$lib/types/downloadType';
import { logger } from '$lib/utils/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  const service = new DownloadTabService(
    params.downloadType as DownloadTabType
  );

  logger.info(`Starting download with: ${JSON.stringify(params)}`);

  const response = await service.download(request);

  return jsonWithCors(request, response);
}) satisfies RequestHandler;
