import { pick } from 'lodash-es';
import type {
  SongsterrDownloadResponse,
  SongsterrPartialMetadata
} from '$lib/types';
import { toastError } from './toast.util';
import { logger } from './logger';
import { ERROR_DOWNLOADING_TAB_TOAST_MESSAGE } from '$lib/constants/error-downloading-tab-toast-message';

export const apiService = {
  download: {
    byRevisionJson(
      searchResult: SongsterrPartialMetadata
    ): Promise<SongsterrDownloadResponse> {
      return wrapWithErrorHandling(
        make({
          endpoint: 'download/byRevisionJson',
          method: 'POST',
          params: {
            songTitle: searchResult.title,
            ...pick(searchResult, ['byLinkUrl'])
          }
        }),
        ERROR_DOWNLOADING_TAB_TOAST_MESSAGE
      );
    },
    byRevisionJsonMidi(
      searchResult: SongsterrPartialMetadata
    ): Promise<SongsterrDownloadResponse> {
      return wrapWithErrorHandling(
        make({
          endpoint: 'download/byRevisionJsonMidi',
          method: 'POST',
          params: {
            songTitle: searchResult.title,
            ...pick(searchResult, ['byLinkUrl'])
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
