import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logger } from '$lib/utils/logger';
import { getSongsToBulkDownloadFromArtistId } from '$lib/server/services/songsterr.service';
import { ParamsHelper } from '$lib/server/utils/params';

export const GET = (async ({ url }) => {
  try {
    const params = getRequiredParams(url);
    if (params.withBulkSongsToDownload) {
      return json({
        bulkSongsToDownload: await getSongsToBulkDownloadFromArtistId(
          params.artistId
        )
      });
    }

    return json({ success: true });
  } catch (error) {
    logger.error('error getting info', error);
    return json({ error: 'error getting song info' });
  }
}) satisfies RequestHandler;

function getRequiredParams(url: URL): GetSongInfoParams {
  const paramsHelper = new ParamsHelper();
  return paramsHelper.getParamsFromUrl({
    url,
    params: [
      {
        key: 'artistId',
        required: true
      },
      {
        key: 'withBulkSongsToDownload'
      }
    ]
  });
}
