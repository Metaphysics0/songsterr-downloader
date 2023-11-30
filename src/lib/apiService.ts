export const apiService = {
  search: {
    bySongOrArtist: async (
      searchText: string
    ): Promise<ISearchResultResponse> => {
      return fetchAndReturnJson({
        endpoint: 'search',
        method: 'POST',
        params: { searchText }
      });
    }
  },
  download: {
    bySearchResult: async (
      searchResult: ISearchResult | IPartialSearchResult
    ): Promise<SongsterrDownloadResponse> => {
      return fetchAndReturnJson({
        endpoint: 'download',
        method: 'GET',
        params: {
          songId: searchResult.songId,
          songTitle: searchResult.title,
          byLinkUrl: searchResult?.byLinkUrl
        }
      });
    },
    bulkDownload: async ({
      selectedSong,
      secretAccessCode
    }: {
      selectedSong: ISearchResult | IPartialSearchResult;
      secretAccessCode: string;
    }): Promise<SongsterrDownloadResponse> => {
      return fetchAndReturnJson({
        endpoint: 'download',
        method: 'POST',
        params: {
          artistId: selectedSong.artistId,
          artistName: selectedSong.artist,
          secretAccessCode
        }
      });
    },
    bySource: async (
      searchResult: ISearchResult | IPartialSearchResult
    ): Promise<SongsterrDownloadResponse> => {
      return fetchAndReturnJson({
        endpoint: 'download/by_source',
        method: 'POST',
        params: {
          source: searchResult.source,
          songTitle: searchResult.title,
          songId: searchResult.songId
        }
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
