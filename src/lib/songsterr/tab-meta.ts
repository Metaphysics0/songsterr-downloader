import type {
  SelectedSong,
  SongsterrStateMetaCurrentTrack,
  SongsterrSyncSet
} from '$lib/types';

/*
 * Tab metadata reaches the app from two untrusted places: the server action
 * (Songsterr's page state) and the bookmarklet hand-off (a URL fragment anyone
 * can craft and share). Its ids and image hash are interpolated into CDN URLs,
 * so everything is checked against a strict shape before it is used.
 */

const MAX_TRACKS = 100;
const MAX_TEXT_LENGTH = 300;
const MAX_SYNC_SETS = 200;
const MAX_SYNC_POINTS = 5000;
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const IMAGE_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

export class InvalidTabMetaError extends Error {
  constructor(reason: string) {
    super(`Invalid Songsterr tab data: ${reason}`);
    this.name = 'InvalidTabMetaError';
  }
}

export function parseSelectedSong(input: unknown): SelectedSong {
  if (!isRecord(input)) throw new InvalidTabMetaError('not an object');

  const songId = positiveInteger(input.songId, 'songId');
  const revisionId = positiveInteger(input.revisionId, 'revisionId');

  if (typeof input.image !== 'string' || !IMAGE_PATTERN.test(input.image)) {
    throw new InvalidTabMetaError('image');
  }

  if (!Array.isArray(input.tracks) || input.tracks.length === 0) {
    throw new InvalidTabMetaError('tracks');
  }
  if (input.tracks.length > MAX_TRACKS) {
    throw new InvalidTabMetaError('too many tracks');
  }

  const song: SelectedSong = {
    songId,
    revisionId,
    image: input.image,
    title: text(input.title) || 'Song',
    artist: text(input.artist) || 'Unknown Artist',
    tracks: input.tracks.map(parseTrack)
  };

  if (Number.isSafeInteger(input.artistId) && (input.artistId as number) > 0) {
    song.artistId = input.artistId as number;
  }

  const byLinkUrl = text(input.byLinkUrl);
  if (byLinkUrl && /^https:\/\/www\.songsterr\.com\//.test(byLinkUrl)) {
    song.byLinkUrl = byLinkUrl;
  }

  const syncSets = parseSyncSets(input.syncSets);
  if (syncSets.length > 0) song.syncSets = syncSets;

  return song;
}

/*
 * The video-points list: `[{ videoId, points: [seconds...] }]`. Sets
 * that are unusable (bad video id, too short, not numbers) are dropped
 * instead of failing the whole tab.
 */
export function parseSyncSets(input: unknown): SongsterrSyncSet[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const sets: SongsterrSyncSet[] = [];
  for (const entry of input) {
    if (sets.length >= MAX_SYNC_SETS) break;
    if (!isRecord(entry)) continue;
    const { videoId, points } = entry;
    if (typeof videoId !== 'string' || !VIDEO_ID_PATTERN.test(videoId))
      continue;
    if (
      !Array.isArray(points) ||
      points.length < 2 ||
      points.length > MAX_SYNC_POINTS ||
      !points.every(
        (point) => typeof point === 'number' && Number.isFinite(point)
      )
    ) {
      continue;
    }
    // The same video can be listed several times with different points, and
    // each is kept; only an exact repeat is dropped.
    const key = `${videoId}:${points.join(',')}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const set: SongsterrSyncSet = { videoId, points: points as number[] };
    const feature = text(entry.feature).slice(0, 32);
    if (feature) set.feature = feature;
    if (
      Array.isArray(entry.tracks) &&
      entry.tracks.length <= MAX_TRACKS &&
      entry.tracks.every(
        (track) => Number.isSafeInteger(track) && track >= 0 && track <= 1000
      )
    ) {
      set.tracks = entry.tracks as number[];
    }
    sets.push(set);
  }
  return sets;
}

function parseTrack(input: unknown): SongsterrStateMetaCurrentTrack {
  if (!isRecord(input)) throw new InvalidTabMetaError('track');

  const partId = input.partId;
  if (
    !Number.isSafeInteger(partId) ||
    (partId as number) < 0 ||
    (partId as number) > 1000
  ) {
    throw new InvalidTabMetaError('track partId');
  }

  const instrumentId = input.instrumentId;
  if (
    !Number.isSafeInteger(instrumentId) ||
    (instrumentId as number) < 0 ||
    (instrumentId as number) > 1024
  ) {
    throw new InvalidTabMetaError('track instrumentId');
  }

  const track: SongsterrStateMetaCurrentTrack = {
    partId: partId as number,
    instrumentId: instrumentId as number
  };

  const title = text(input.title);
  if (title) track.title = title;
  const name = text(input.name);
  if (name) track.name = name;
  if (typeof input.isDrums === 'boolean') track.isDrums = input.isDrums;

  if (
    Array.isArray(input.tuning) &&
    input.tuning.length <= 12 &&
    input.tuning.every(
      (note) => Number.isSafeInteger(note) && note >= 0 && note <= 127
    )
  ) {
    track.tuning = input.tuning as number[];
  }

  return track;
}

/*
 * The bookmarklet sends `#songsterr=<base64url(JSON)>`. A fragment is never
 * sent to the server, so the payload stays in the browser.
 */
export const TAB_HASH_KEY = 'songsterr';

export function readSelectedSongFromHash(hash: string): SelectedSong | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const encoded = params.get(TAB_HASH_KEY);
  if (!encoded) return null;

  let decoded: unknown;
  try {
    decoded = JSON.parse(decodeBase64Url(encoded));
  } catch {
    throw new InvalidTabMetaError('could not decode payload');
  }
  return parseSelectedSong(decoded);
}

export function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function positiveInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    throw new InvalidTabMetaError(field);
  }
  return value as number;
}

function text(value: unknown): string {
  return typeof value === 'string'
    ? value.trim().slice(0, MAX_TEXT_LENGTH)
    : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
