interface SongsterrDownloadResponse {
  file: number[];
  fileName: string;
  contentType: string;
}

type IBadge = 'new' | 'pro';

interface ISearchResultResponse {
  searchResults: ISearchResult[];
}
interface ISearchResult {
  hasPlayer: boolean;
  artist: string;
  artistId: number;
  title: string;
  songId: number;
  tracks: IArtistTrack[];
  hasChords: boolean;
  defaultTrack: number;
}

interface IArtistTrack {
  tuning?: number[];
  tuningString?: string;
  instrumentId: number;
  dailyViews: number;
  views: number;
  difficulty?: string;
}
