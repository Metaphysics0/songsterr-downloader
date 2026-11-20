export type DownloadType = 'gp' | 'midi' | 'mpak';

export interface MidiDownloadOptions {
  separateTracks: boolean;
}

export interface MpakDownloadOptions {
  allVideos: boolean;
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

/*
 * Everything the browser needs to fetch and convert a tab without asking the
 * server: the CDN revision coordinates plus display fields.
 */
/*
 * One YouTube video the tab site has synced to the tab: the start time of every
 * played bar (repeats expanded), in seconds, as served by its video-points API.
 */
export interface SongsterrSyncSet {
  videoId: string;
  /** Start of each played bar in seconds, in playback order. */
  points: number[];
  /** The tab site's ids for this record, its link to the video, and the tab revision the points were made for. */
  id?: number;
  revisionToVideoId?: number;
  revisionId?: number;
  /** The kind of video: "alternative", "backing", "solo", or none. */
  feature?: string;
  /** Indices into the tab's tracks that a backing or solo video covers. */
  tracks?: number[];
}

export interface SelectedSong extends SongsterrStateMetaCurrent {
  artistId?: number;
  byLinkUrl?: string;
  /** YouTube videos with bar start times; absent when none are synced. */
  syncSets?: SongsterrSyncSet[];
  /** How the song reached the app; set client-side, for analytics. */
  source?: SelectedSongSource;
}

export type SelectedSongSource = 'bookmarklet' | 'link';

export interface SongsterrRevisionAutomationTempoPoint {
  measure: number;
  position: number;
  bpm: number;
  type: number;
}

export interface SongsterrRevisionAutomations {
  tempo?: SongsterrRevisionAutomationTempoPoint[];
}

export interface SongsterrRevisionBendPoint {
  position: number;
  tone: number;
}

export interface SongsterrRevisionBendPayload {
  tone: number;
  points: SongsterrRevisionBendPoint[];
}

export interface SongsterrRevisionNotePayload {
  fret?: number;
  string?: number;
  tie?: boolean;
  slide?: string;
  rest?: boolean;
  dead?: boolean;
  ghost?: boolean;
  hp?: boolean;
  staccato?: boolean;
  accentuated?: boolean;
  vibrato?: boolean;
  wideVibrato?: boolean;
  harmonic?: string;
  harmonicFret?: number;
  bend?: SongsterrRevisionBendPayload;
}

export interface SongsterrRevisionBeatPayload {
  notes?: SongsterrRevisionNotePayload[];
  type?: number;
  duration?: [number, number];
  dots?: number;
  text?: string | { text: string; width?: number };
  velocity?: string;
  rest?: boolean;
  palmMute?: boolean;
  vibrato?: boolean;
  wideVibrato?: boolean;
  vibratoWithTremoloBar?: string;
  pickStroke?: string;
  tuplet?: number;
  tupletStart?: boolean;
  tupletStop?: boolean;
  /** Grace note style: "beforeBeat" | "onBeat". Must not consume bar duration. */
  graceNote?: string;
}

export interface SongsterrRevisionVoicePayload {
  beats?: SongsterrRevisionBeatPayload[];
  rest?: boolean;
}

export interface SongsterrRevisionMeasurePayload {
  voices?: SongsterrRevisionVoicePayload[];
  signature?: [number, number];
  marker?: string | { text: string; width?: number };
  repeatStart?: boolean;
  repeatCount?: number;
  /** Songsterr's actual field name for the total play count ("3x" repeats). */
  repeat?: number;
  /** Ending numbers ([1], [2], [1,2]) or a pre-built bitmask. */
  alternateEnding?: number | number[];
  doubleBarline?: boolean;
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
