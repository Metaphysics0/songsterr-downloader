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
  fromUltimateGuitar?: boolean;

  bulkSongsToDownload?: { songTitle: string }[];
}

interface IPartialSearchResult {
  title: string;
  songId: number;
  artistId: number;
  fromUltimateGuitar?: boolean;
  artist: string;
  source?: string;
  byLinkUrl?: string;
  bulkSongsToDownload?: { songTitle: string }[];
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
