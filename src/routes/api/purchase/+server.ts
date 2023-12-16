import { jsonWithCors } from '$lib/server/cors';
import { BulkDownloadService } from '$lib/server/services/bulkDownload.service';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request }) => {
  const params = await request.json();

  const bulkTabsData = await new BulkDownloadService(
    params.artistId
  ).getZipFileOfAllTabs();

  return json({ purchased: 'true' });
}) satisfies RequestHandler;
