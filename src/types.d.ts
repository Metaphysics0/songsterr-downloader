interface SongsterrDownloadResponse {
  file: number[];
  fileName: string;
  contentType: string;
}

interface ISelectedSongResponse {
  downloadLink: string;
  selectedSong: ISearchResult;
  songTitle: ISelectedSongTitle;
}

interface ISelectedSongTitle {
  artist: string;
  songName: string;
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
  byLinkUrl?: string;
  tracks: IArtistTrack[];
  hasChords: boolean;
  defaultTrack: number;
  source?: string;
}

interface IPartialSearchResult {
  title: string;
  songId: number;
  artistId: number;
  artist: string;
  source?: string;
  byLinkUrl?: string;
}

interface GetSelectedSongFromUrlResponse {
  searchResult: IPartialSearchResult;
  existingDownloadLink?: string | null | undefined;
  error?: any;
}

interface IArtistTrack {
  tuning?: number[];
  tuningString?: string;
  instrumentId: number;
  dailyViews: number;
  views: number;
  difficulty?: string;
}
