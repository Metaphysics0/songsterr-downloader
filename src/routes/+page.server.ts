import { getSongsterrMetadataFromSongsterrUrl } from '$lib/server/services/songsterr.service';
import { logger } from '$lib/utils/logger';
import { isUrlFromSongsterr } from '$lib/utils/url';
import type { Actions } from './$types';

export const actions = {
  getSongsterrMetadataFromSongsterrUrl: async ({
    request
  }): Promise<IPartialSearchResult | undefined> => {
    try {
      const url = await getUrlParam(request);
      if (!isUrlFromSongsterr(url)) {
        throw new Error(`${url} is not a valid songsterr link.`);
      }

      return getSongsterrMetadataFromSongsterrUrl(url!);
    } catch (error) {
      logger.error('#getSongsterrMetadataFromSongsterrUrl failed', error);
      return undefined;
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}
