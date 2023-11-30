import { SONGSTERR_URL_REGEX_PATTERN } from '../consts';
import { getSearchResultFromSongsterrUrl } from '$lib/server/songsterrService';

import type { Actions } from './$types';
import { storeDownloadLinkRepository } from '$lib/server/repositories/storeDownloadLink.repository';
import { logger } from '$lib/utils/logger';

export const actions = {
  getSelectedSongFromUrl: async ({
    request
  }): Promise<IPartialSearchResult | undefined> => {
    const url = await getUrlParam(request);
    try {
      if (!isUrlValid(url)) {
        throwUrlIsInvalidError(url);
      }

      return getSearchResultFromSongsterrUrl(url!);
    } catch (error) {
      logger.error('error getting download link and song title', error);
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}

function getIdFromUrl(url: string) {
  return url.split('-').at(-1);
}

function isUrlValid(url: any) {
  return SONGSTERR_URL_REGEX_PATTERN.test(String(url));
}

function throwUrlIsInvalidError(url: string | undefined) {
  throw `${url} is not a valid songsterr link.`;
}
/*
 *  private
 */
