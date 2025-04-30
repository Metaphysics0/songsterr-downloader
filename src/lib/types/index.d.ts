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

  bulkSongsToDownload?: { title: string }[];
}

interface IPartialSearchResult {
  title: string;
  songId: number;
  artistId: number;
  artist: string;
  source?: string;
  byLinkUrl?: string;
  bulkSongsToDownload?: { title: string }[];
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

type SongsterrRevisionsResponse = SongsterrRevisionsItem[];

interface SongsterrRevisionsItem {
  songId: number;
  revisionId: number;
  createdAt: string;
  artist: string;
  title: string;
  author: Author;
  description: string;
  tracksCount: number;
  commentsCount: number;
  isDeleted: boolean;
  isBlocked: boolean;
  isOnModeration: boolean;
  reports: any[];
  gpImport: boolean;
  aiGenerated: boolean;
  createdVia: string;
  person: string;
  personId: number;
  descriptionLang: string;
  source: string;
  moderationType: string;
  reviewed: Reviewed;
}

interface Reviewed {
  person: string;
  conclusion: string;
  createdAt: string;
}

interface Author {
  personId: number;
  name: string;
  isModerator: boolean;
}
