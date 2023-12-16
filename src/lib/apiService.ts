import { pick } from 'lodash-es';

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
    bulkDownload: async ({
      selectedSong,
      secretAccessCode
    }: {
      selectedSong: ISearchResult | IPartialSearchResult;
      secretAccessCode: string;
    }): Promise<SongsterrDownloadResponse> => {
      return fetchAndReturnJson({
        endpoint: 'download/bulk',
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
        endpoint: 'download/bySource',
        method: 'POST',
        params: {
          songTitle: searchResult.title,
          ...pick(searchResult, ['source', 'songId', 'artist', 'byLinkUrl'])
        }
      });
    },
    fromUltimateGuitar: async (
      searchResult: ISearchResult | IPartialSearchResult
    ): Promise<SongsterrDownloadResponse> => {
      return fetchAndReturnJson({
        endpoint: 'download/ultimate-guitar',
        method: 'POST',
        params: {
          songTitle: searchResult.title,
          ...pick(searchResult, ['source', 'songId', 'artist', 'byLinkUrl'])
        }
      });
    }
  },
  purchase: {
    post({
      paymentData,
      totalBilledAmount,
      purchaserEmail,
      artistId
    }: {
      paymentData: any;
      totalBilledAmount: string;
      purchaserEmail: string;
      artistId: number | string;
    }) {
      return fetchAndReturnJson({
        endpoint: 'purchase',
        method: 'POST',
        params: {
          paymentData,
          purchaserEmail,
          totalBilledAmount,
          artistId
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
