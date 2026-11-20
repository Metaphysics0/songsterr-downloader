import { zipSync } from 'fflate';

/*
 * Writes a Music Pack (.mpak) archive, version 1: the score stored
 * untouched, one YouTube recording per synced video, and a bar-anchored sync
 * file for each recording that has points. The points are the bar start times
 * in seconds as the tab site returns them (spec section 9.1, "Bar times"). Layout and rules: SPEC.md in the
 * Music Pack specification (sections 3, 4, 6, 7, 9). The first recording is the
 * default, so recordings with sync points are listed first.
 */

const SCORE_ID = 'main';

export const MPAK_MEDIA_TYPE = 'application/vnd.mpak+zip';

export interface MpakRecordingInput {
  videoId: string;
  label: string;
  /** Start of each bar in seconds; absent when the video could not be synced. */
  points?: number[];
  /** The tab site's ids for the points, kept in the sync file. */
  sync?: { revisionId?: number; id?: number; revisionToVideoId?: number };
  /** The kind of video and the tab tracks it covers. */
  feature?: string;
  tracks?: number[];
  /** Names of those tracks in the score file, one per index (spec "names"). */
  trackNames?: string[];
}

export interface BuildMpakInput {
  title: string;
  artist: string;
  /** The Guitar Pro 7+ file, stored byte for byte. */
  tab: { bytes: Uint8Array; name: string };
  recordings: MpakRecordingInput[];
  generator: { name: string; version?: string };
  /** The tab site's id of the song, kept in each sync file. */
  songId?: number;
  createdAt?: Date;
}

function roleFor(feature?: string): string {
  if (!feature) return 'original';
  return feature === 'alternative' ? 'alternate' : feature;
}

// The tab tracks a video covers (spec section 7, "Tracks in a recording"): a
// backing video lacks them, a solo video has only them.
function scoreTracksFor(recording: MpakRecordingInput) {
  if (!recording.tracks?.length) return undefined;
  const names =
    recording.trackNames?.length === recording.tracks.length
      ? { names: recording.trackNames }
      : {};
  if (recording.feature === 'backing')
    return { [SCORE_ID]: { omits: recording.tracks, ...names } };
  if (recording.feature === 'solo')
    return { [SCORE_ID]: { only: recording.tracks, ...names } };
  return undefined;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>)
  );
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

export async function buildMpak(input: BuildMpakInput): Promise<Uint8Array> {
  const now = (input.createdAt ?? new Date()).toISOString();
  const encoder = new TextEncoder();
  const json = (value: unknown) =>
    encoder.encode(JSON.stringify(value, null, 2));

  // The first recording is the default (spec section 7); put a synced one first.
  const ordered = [
    ...input.recordings.filter((recording) => recording.points?.length),
    ...input.recordings.filter((recording) => !recording.points?.length)
  ];
  const recordings = ordered.map((recording, index) => ({
    ...recording,
    id: `v${index + 1}`
  }));

  // The sync files are written first so that the manifest can state their size and hash (spec section 4, "Integrity").
  const syncFiles: Record<string, Uint8Array> = {};
  const entries: Record<string, { size: number; sha256: string }> = {};
  for (const recording of recordings) {
    if (!recording.points?.length) continue;
    const path = `sync/${recording.id}.json`;
    const bytes = json({
      version: 1,
      recording: recording.id,
      score: SCORE_ID,
      anchorType: 'bar',
      updatedAt: now,
      revisionId: recording.sync?.revisionId,
      videoId: recording.videoId,
      'x-songsterr-songId': input.songId,
      'x-songsterr-id': recording.sync?.id,
      'x-songsterr-revisionToVideoId': recording.sync?.revisionToVideoId,
      points: recording.points
    });
    syncFiles[path] = bytes;
    entries[path] = { size: bytes.length, sha256: await sha256Hex(bytes) };
  }

  const scoreSha256 = await sha256Hex(input.tab.bytes);
  const manifest = {
    format: 'mpak',
    version: 1,
    id: crypto.randomUUID(),
    createdAt: now,
    generator: input.generator,
    song: { title: input.title, artist: input.artist },
    scores: [
      {
        id: SCORE_ID,
        path: 'score/song.gp',
        format: 'gp',
        sha256: scoreSha256,
        size: input.tab.bytes.length,
        name: input.tab.name,
        origin: 'Songsterr'
      }
    ],
    ...(recordings.length > 0
      ? {
          recordings: recordings.map((recording) => ({
            id: recording.id,
            role: roleFor(recording.feature),
            label: recording.label,
            ...(recording.points?.length
              ? { sync: { [SCORE_ID]: `sync/${recording.id}.json` } }
              : {}),
            sources: [{ type: 'youtube', videoId: recording.videoId }],
            ...(scoreTracksFor(recording)
              ? { scoreTracks: scoreTracksFor(recording) }
              : {})
          }))
        }
      : {}),
    ...(Object.keys(entries).length > 0 ? { entries } : {})
  };

  const files: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {
    'manifest.json': json(manifest),
    // The score is already a ZIP; deflating it again gains nothing.
    'score/song.gp': [input.tab.bytes, { level: 0 }]
  };

  Object.assign(files, syncFiles);

  return zipSync(files as Parameters<typeof zipSync>[0]);
}
