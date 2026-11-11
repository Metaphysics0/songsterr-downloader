import { logger } from '$lib/server/logger';
import { isUrlFromSongsterr } from '$lib/utils/input-validation';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SongsterrService } from '$lib/server/services/songsterr.service';
import type { SelectedSong } from '$lib/types';
import { SongsterrBlockedError } from '$lib/server/utils/scraper.util';

export const actions = {
  getMetadataFromTabUrl: async ({ request }) => {
    try {
      const url = await getUrlParam(request);
      if (!isUrlFromSongsterr(url)) {
        throw new Error(`${url} is not a valid songsterr link.`);
      }

      // `await` is required: returning the bare promise lets a rejection
      // escape this try/catch and surface as an unhandled 500 error page.
      const metadata: SelectedSong =
        await new SongsterrService().getSelectedSongFromTabUrl(url!);
      return metadata;
    } catch (error) {
      logger.error({ err: error }, '#getMetadataFromTabUrl failed');
      if (error instanceof SongsterrBlockedError) {
        return fail(503, {
          code: 'songsterr_blocked',
          message:
            'Songsterr is currently blocking automated requests from our server, so we could not load this tab from a link. Use the bookmarklet below instead — it reads the tab straight from the Songsterr page you have open.'
        });
      }
      return fail(502, {
        message:
          'Could not load song data from Songsterr. Double-check the link and try again.'
      });
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}
