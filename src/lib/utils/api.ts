import { pick } from 'lodash-es';
import type {
  SongsterrSearchMetadataResponse,
  SongsterrDownloadResponse,
  SongsterrPartialMetadata
} from '$lib/types';
import { toastError } from './toast.util';
import { logger } from './logger';
import { ERROR_DOWNLOADING_TAB_TOAST_MESSAGE } from '$lib/constants/error-downloading-tab-toast-message';
import { extractYoutubeVideoUrlFromMetadata } from './extract-youtube-video-from-metadata.util';

export const apiService = {
  search(searchText: string): Promise<SongsterrSearchMetadataResponse> {
    return make({
      endpoint: 'search',
      method: 'POST',
      params: { searchText }
    });
  },
  download: {
    bySearchResult(
      searchResult: SongsterrPartialMetadata
    ): Promise<SongsterrDownloadResponse> {
      const youtubeVideoUrl = extractYoutubeVideoUrlFromMetadata(searchResult);
      return wrapWithErrorHandling(
        make({
          endpoint: 'download/bySearchResult',
          method: 'POST',
          params: {
            songTitle: searchResult.title,
            youtubeVideoUrl,
            ...pick(searchResult, ['artist', 'songId', 'byLinkUrl'])
          }
        }),
        ERROR_DOWNLOADING_TAB_TOAST_MESSAGE
      );
    },
    bySource(
      searchResult: SongsterrPartialMetadata
    ): Promise<SongsterrDownloadResponse> {
      const youtubeVideoUrl = extractYoutubeVideoUrlFromMetadata(searchResult);

      return wrapWithErrorHandling(
        make({
          endpoint: 'download/bySource',
          method: 'POST',
          params: {
            youtubeVideoUrl,
            songTitle: searchResult.title,
            ...pick(searchResult, ['source', 'songId', 'artist', 'byLinkUrl'])
          }
        }),
        ERROR_DOWNLOADING_TAB_TOAST_MESSAGE
      );
    }
  }
};

async function make<T>({ endpoint, method, params }: MakeApiArgs): Promise<T> {
  let baseUrl = `/api/${endpoint}`;
  if (method === 'GET' && params) {
    // TS-Ignoring here because params are optional for GET routes
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    baseUrl += '?' + new URLSearchParams(params).toString();
  }

  const options = {
    method,
    headers: {
      'content-type': 'application/json'
    }
  };
  const body = method !== 'GET' && params ? JSON.stringify(params) : null;
  const response = await fetch(baseUrl, body ? { ...options, body } : options);
  if (!response.ok) {
    logger.error('Error fetching', {
      url: baseUrl,
      status: response.status,
      statusText: response.statusText
    });
    throw new Error();
  }
  return response.json() as Promise<T>;
}

async function wrapWithErrorHandling<T>(
  promise: Promise<T>,
  errorMessage: string = 'Something went wrong'
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    toastError(errorMessage);
    throw new Error(errorMessage);
  }
}

interface MakeApiArgs {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
  params?: unknown;
}
