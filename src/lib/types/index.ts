export interface SongsterrDownloadResponse {
  file: number[];
  fileName: string;
  contentType: string;
}

export interface SongsterrSelectedResponse {
  downloadLink: string;
  selectedSong: SongsterrMetadata;
  songTitle: SongsterrTitle;
}

export interface SongsterrTitle {
  artist: string;
  songName: string;
}

export interface SongsterrSearchMetadataResponse {
  searchResults: SongsterrMetadata[];
}

export interface SongsterrMetadata {
  hasPlayer: boolean;
  artist: string;
  artistId: number;
  title: string;
  songId: number;
  byLinkUrl?: string;
  tracks: SongsterrTrack[];
  hasChords: boolean;
  defaultTrack: number;
  source?: string;
  bulkSongsToDownload?: { title: string }[];
}

export interface SongsterrPartialMetadata {
  title: string;
  songId: number;
  artistId: number;
  artist: string;
  source?: string;
  byLinkUrl?: string;
  bulkSongsToDownload?: { title: string }[];
}

export interface GetSongFromUrlResponse {
  metadata: SongsterrPartialMetadata;
  existingDownloadLink?: string | null | undefined;
  error?: any;
}

export interface SongsterrTrack {
  tuning?: number[];
  tuningString?: string;
  instrumentId: number;
  dailyViews: number;
  views: number;
  difficulty?: string;
}

export type SongsterrRevisionsResponse = SongsterrRevisionsItem[];

export interface SongsterrRevisionsItem {
  songId: number;
  revisionId: number;
  createdAt: string;
  artist: string;
  title: string;
  author: SongsterrAuthor;
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
  reviewed: SongsterrReviewed;
}

export interface SongsterrReviewed {
  person: string;
  conclusion: string;
  createdAt: string;
}

export interface SongsterrAuthor {
  personId: number;
  name: string;
  isModerator: boolean;
}

export interface SongsterrStateMetaCurrentTrack {
  partId: number;
  instrumentId: number;
  title?: string;
  name?: string;
  tuning?: number[];
  isDrums?: boolean;
}

export interface SongsterrStateMetaCurrent {
  songId: number;
  revisionId: number;
  image: string;
  title: string;
  artist: string;
  tracks: SongsterrStateMetaCurrentTrack[];
}

export interface SongsterrRevisionAutomationTempoPoint {
  measure: number;
  position: number;
  bpm: number;
  type: number;
}

export interface SongsterrRevisionAutomations {
  tempo?: SongsterrRevisionAutomationTempoPoint[];
}

export interface SongsterrRevisionNotePayload {
  fret?: number;
  string?: number;
  tie?: boolean;
  slide?: string;
  rest?: boolean;
}

export interface SongsterrRevisionBeatPayload {
  notes?: SongsterrRevisionNotePayload[];
  duration?: [number, number];
  dots?: number;
  text?: string;
  velocity?: string;
  rest?: boolean;
}

export interface SongsterrRevisionVoicePayload {
  beats?: SongsterrRevisionBeatPayload[];
  rest?: boolean;
}

export interface SongsterrRevisionMeasurePayload {
  voices?: SongsterrRevisionVoicePayload[];
  signature?: [number, number];
  marker?: string;
  repeatStart?: boolean;
  repeatCount?: number;
  alternateEnding?: number;
  rest?: boolean;
}

export interface SongsterrRevisionTrackPayload {
  name?: string;
  instrumentId?: number;
  tuning?: number[];
  strings?: number;
  measures: SongsterrRevisionMeasurePayload[];
  automations?: SongsterrRevisionAutomations;
  songId?: number;
  revisionId?: number;
  partId?: number;
}

export interface ConversionWarning {
  code: string;
  message: string;
  location?: string;
}
