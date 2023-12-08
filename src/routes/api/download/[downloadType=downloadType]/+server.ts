import { jsonWithCors } from '$lib/server/cors';
import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import type { DownloadTabType } from '$lib/types/downloadType';
import type { RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  const service = new DownloadTabService(
    params.downloadType as DownloadTabType
  );
  const response = await service.download(request);

  return jsonWithCors(response);
}) satisfies RequestHandler;
