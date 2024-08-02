export interface ISearchResultByArtist {
  hasPlayer: boolean;
  artist: string;
  artistId: number;
  title: string;
  songId: number;
  tracks: any[];
  hasChords: false;
  defaultTrack: number;
}

export interface IDownloadLinkAndSongTitle {
  downloadLink: string;
  songTitle: string;
}

export interface BulkSongToDownload {
  songId: number;
  title: string;
}
