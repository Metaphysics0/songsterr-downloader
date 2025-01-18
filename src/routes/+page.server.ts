import { getSearchResultFromSongsterrUrl } from '$lib/server/services/songsterr.service';
import { logger } from '$lib/utils/logger';
import { isUrlFromSongsterr, isUrlFromUltimateGuitar } from '$lib/utils/url';
import { createGetMockSearchResultResponse } from '$lib/mocks';
import type { Actions } from './$types';
import { UltimateGuitarService } from '$lib/server/services/ultimateGuitar.service';
import { startCase } from 'lodash-es';

export const actions = {
  getSelectedSongFromUrl: async ({
    request
  }): Promise<GetSelectedSongFromUrlResponse> => {
    const url = await getUrlParam(request);

    if (isUrlFromUltimateGuitar(url)) {
      // @ts-ignore
      return searchResultFromUltimateGuitar(url!);
    }

    try {
      if (!isUrlFromSongsterr(url))
        throw new Error(`${url} is not a valid songsterr link.`);

      return {
        searchResult: await getSearchResultFromSongsterrUrl(url!)
      };
    } catch (error) {
      logger.error('#getSelectedSongFromUrl failed', error);

      return {
        searchResult: createGetMockSearchResultResponse(),
        error: 'failed getting download link'
      };
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}

function searchResultFromUltimateGuitar(url: string) {
  const { songMetadataFromUrl } = new UltimateGuitarService(url!);
  return {
    searchResult: {
      title: startCase(songMetadataFromUrl.songName!),
      artist: startCase(songMetadataFromUrl.artist!),
      fromUltimateGuitar: true
    }
  };
}
