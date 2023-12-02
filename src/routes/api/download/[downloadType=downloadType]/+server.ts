import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import type { DownloadTabType } from '$lib/types/downloadType';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  const service = new DownloadTabService(
    params.downloadType as DownloadTabType
  );
  const response = await service.download(request);

  return json(response);
}) satisfies RequestHandler;
