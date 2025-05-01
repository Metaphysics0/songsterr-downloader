import { DownloadTabService } from '$lib/server/services/download-tab.service';
import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';
import { logger } from '$lib/utils/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  const service = new DownloadTabService(
    params.downloadType as SupportedTabDownloadType
  );

  logger.info(`Starting download with: ${JSON.stringify(params)}`);

  const response = await service.download(request);

  return json(response);
}) satisfies RequestHandler;
