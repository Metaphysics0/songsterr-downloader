import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logger } from '$lib/utils/logger';
import { getSongsToBulkDownloadFromArtistId } from '$lib/server/services/songsterr.service';

export const GET = (async ({ request, url }) => {
  const params = getSupportedParamsFromUrl(url);
  if (!params.artistId) {
    logger.error(
      'getSongInfo',
      'unable to retrieve info due to no artistId param'
    );
    return json({ info: {} });
  }

  if (params.withBulkSongsToDownload) {
    return json({
      bulkSongsToDownload: await getSongsToBulkDownloadFromArtistId(
        String(params.artistId)
      )
    });
  }

  return json({ success: true });
}) satisfies RequestHandler;

function getSupportedParamsFromUrl(url: URL): GetSongInfoParams {
  return {
    artistId: url.searchParams.get('artistId') ?? undefined,
    withBulkSongsToDownload: Boolean(
      url.searchParams.get('withBulkSongsToDownload')
    )
  };
}
