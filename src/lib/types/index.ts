export interface SongsterrDownloadResponse {
  file: number[];
  fileName: string;
  contentType: string;
}

export interface SongsterrPartialMetadata {
  title: string;
  songId: number;
  artistId: number;
  artist: string;
  byLinkUrl?: string;
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
