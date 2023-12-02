import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  // @ts-ignore
  const service = new DownloadTabService(params.downloadType);
  const response = await service.download(request);

  return json(response);
}) satisfies RequestHandler;
