import { getSearchResultFromSongsterrUrl } from '$lib/server/services/songsterr.service';
import { DownloadLinkRepository } from '$lib/server/repositories/downloadLink.repository';
import { logger } from '$lib/utils/logger';
import {
  isUrlFromSongsterr,
  getIdFromUrl,
  isUrlFromUltimateGuitar
} from '$lib/utils/url';
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
      const { songMetadataFromUrl } = new UltimateGuitarService(url!);
      return {
        // @ts-ignore
        searchResult: {
          title: startCase(songMetadataFromUrl.songName!),
          artist: startCase(songMetadataFromUrl.artist!),
          // @ts-ignore
          fromUltimateGuitar: true
        }
      };
    }

    try {
      const downloadLinkRepository = new DownloadLinkRepository();

      if (!isUrlFromSongsterr(url)) {
        throw `${url} is not a valid songsterr link.`;
      }

      const existingDownloadLink =
        await downloadLinkRepository.getS3DownloadLinkSongsterrSongId(
          getIdFromUrl(url!)!
        );

      if (existingDownloadLink) {
        logger.log('retrieved existing download link', existingDownloadLink);
      }

      const searchResult = await getSearchResultFromSongsterrUrl(url!);
      return {
        searchResult,
        existingDownloadLink
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
