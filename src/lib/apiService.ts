import { pick } from 'lodash-es';

export const apiService = {
  search: {
    bySongOrArtist(searchText: string): Promise<ISearchResultResponse> {
      return fetchAndReturnJson({
        endpoint: 'search',
        method: 'POST',
        params: { searchText }
      });
    }
  },
  download: {
    bySearchResult(
      searchResult: ISearchResult | IPartialSearchResult
    ): Promise<SongsterrDownloadResponse> {
      return fetchAndReturnJson({
        endpoint: 'download/bySearchResult',
        method: 'POST',
        params: {
          songId: searchResult.songId,
          songTitle: searchResult.title,
          byLinkUrl: searchResult?.byLinkUrl,
          artist: searchResult?.artist
        }
      });
    },
    bySource(
      searchResult: ISearchResult | IPartialSearchResult
    ): Promise<SongsterrDownloadResponse> {
      return fetchAndReturnJson({
        endpoint: 'download/bySource',
        method: 'POST',
        params: {
          songTitle: searchResult.title,
          ...pick(searchResult, ['source', 'songId', 'artist', 'byLinkUrl'])
        }
      });
    }
  },
  song_info: {
    get(params: GetSongInfoParams) {
      return fetchAndReturnJson({
        endpoint: 'song_info',
        method: 'GET',
        params
      });
    }
  }
};

const fetchAndReturnJson = async (args: IMakeApiArgs) =>
  (await make(args)).json();

function make({ endpoint, method, params }: IMakeApiArgs): Promise<Response> {
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
  return fetch(baseUrl, body ? { ...options, body } : options);
}

interface IMakeApiArgs {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
  params?: unknown;
}
