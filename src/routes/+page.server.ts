import { getSearchResultFromSongsterrUrl } from '$lib/server/services/songsterr.service';
import { logger } from '$lib/utils/logger';
import { isUrlFromSongsterr } from '$lib/utils/url';
import type { Actions } from './$types';
import { mockSearchResult } from '$lib/mocks/search-result.mock';

export const actions = {
  getSelectedSongFromUrl: async ({
    request
  }): Promise<GetSelectedSongFromUrlResponse> => {
    const url = await getUrlParam(request);

    try {
      if (!isUrlFromSongsterr(url))
        throw new Error(`${url} is not a valid songsterr link.`);

      return {
        searchResult: await getSearchResultFromSongsterrUrl(url!)
      };
    } catch (error) {
      logger.error('#getSelectedSongFromUrl failed', error);

      return {
        searchResult: mockSearchResult,
        error: 'failed getting download link'
      };
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}
