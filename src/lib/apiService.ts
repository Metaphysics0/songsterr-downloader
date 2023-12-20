import { pick } from 'lodash-es';
import type {
  PayPalCreatePurchaseParams,
  PurchaseBulkTabsParams
} from './types/payments';

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
    bulkDownload({
      selectedSong,
      secretAccessCode
    }: {
      selectedSong: ISearchResult | IPartialSearchResult;
      secretAccessCode: string;
    }): Promise<SongsterrDownloadResponse> {
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
    },
    fromUltimateGuitar(
      searchResult: ISearchResult | IPartialSearchResult
    ): Promise<SongsterrDownloadResponse> {
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
    put(params: PurchaseBulkTabsParams) {
      return fetchAndReturnJson({
        endpoint: 'purchase',
        method: 'PUT',
        params
      });
    }
  },
  orders: {
    create(params: PayPalCreatePurchaseParams) {
      return fetchAndReturnJson({
        endpoint: 'orders',
        method: 'POST',
        params
      });
    },
    ':order_id': {
      capture({
        orderId,
        selectedSong,
        purchaserEmail
      }: {
        orderId: string;
        selectedSong: ISearchResult | IPartialSearchResult;
        purchaserEmail: string;
      }) {
        return fetchAndReturnJson({
          endpoint: `orders/${orderId}/capture`,
          method: 'POST',
          params: { selectedSong, purchaserEmail }
        });
      }
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
