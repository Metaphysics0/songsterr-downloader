import { SONGSTERR_URL_REGEX_PATTERN } from '../consts';
import { getSearchResultFromSongsterrUrl } from '$lib/server/getDownloadLink';

import type { Actions } from './$types';

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
      console.error('error getting download link and song title', error);
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
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
