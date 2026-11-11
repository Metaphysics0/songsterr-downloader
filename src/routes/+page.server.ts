import { logger } from '$lib/server/logger';
import { isUrlFromSongsterr } from '$lib/utils/input-validation';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SongsterrService } from '$lib/server/services/songsterr.service';
import type { SongsterrPartialMetadata } from '$lib/types';

export const actions = {
  getMetadataFromTabUrl: async ({ request }) => {
    try {
      const url = await getUrlParam(request);
      if (!isUrlFromSongsterr(url)) {
        throw new Error(`${url} is not a valid songsterr link.`);
      }

      // `await` is required: returning the bare promise lets a rejection
      // escape this try/catch and surface as an unhandled 500 error page.
      const metadata: SongsterrPartialMetadata =
        await new SongsterrService().getMetadataFromTabUrl(url!);
      return metadata;
    } catch (error) {
      logger.error({ err: error }, '#getMetadataFromTabUrl failed');
      return fail(502, { message: 'Unable to fetch tab data from Songsterr' });
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}
