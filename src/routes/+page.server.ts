import { getSearchResultFromSongsterrUrl } from '$lib/server/songsterrService';
import { downloadLinkRepository } from '$lib/server/repositories/downloadLink.repository';

import type { Actions } from './$types';
import { logger } from '$lib/utils/logger';
import { isUrlValid, getIdFromUrl } from '$lib/utils/url';
import { createGetMockSearchResultResponse } from '$lib/mocks';

export const actions = {
  getSelectedSongFromUrl: async ({
    request,
    fetch
  }): Promise<GetSelectedSongFromUrlResponse> => {
    const url = await getUrlParam(request);
    try {
      if (!isUrlValid(url)) {
        throw `${url} is not a valid songsterr link.`;
      }

      const existingDownloadLink =
        await downloadLinkRepository.findBySongsterrSongId(getIdFromUrl(url!)!);

      if (existingDownloadLink) {
        logger.log('retrieved existing download link', existingDownloadLink);
      }

      return {
        searchResult: await getSearchResultFromSongsterrUrl(url!),
        existingDownloadLink: existingDownloadLink?.downloadLink
      };
    } catch (error) {
      logger.error('#getSelectedSongFromUrl failed', error);
      return {
        searchResult: createGetMockSearchResultResponse(),
        error: 'Error getting song information'
      };
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}
