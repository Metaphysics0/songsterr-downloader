import { logger } from '$lib/server/logger';
import { isUrlFromSongsterr } from '$lib/utils/input-validation';
import type { Actions } from './$types';
import { SongsterrService } from '$lib/server/services/songsterr.service';
import type { SongsterrPartialMetadata } from '$lib/types';

export const actions = {
  getMetadataFromTabUrl: async ({
    request
  }): Promise<SongsterrPartialMetadata | undefined> => {
    try {
      const url = await getUrlParam(request);
      if (!isUrlFromSongsterr(url)) {
        throw new Error(`${url} is not a valid songsterr link.`);
      }

      return new SongsterrService().getMetadataFromTabUrl(url!);
    } catch (error) {
      logger.error({ err: error }, '#getMetadataFromTabUrl failed');
      return undefined;
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}
