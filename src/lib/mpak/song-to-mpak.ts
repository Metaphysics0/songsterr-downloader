import type { SelectedSong, SongsterrSyncSet } from '$lib/types';
import { buildFileNameFromSongName } from '$lib/songsterr/file-name';
import { buildMpak, type MpakRecordingInput } from './build-mpak';

/*
 * Packs a converted tab and its synced YouTube videos as a .mpak.
 * By default only the primary full mix and backing track become recordings;
 * with allVideos, every video does. The times are written as the tab site gives
 * them, one per played bar (spec section 9.1), and the reader matches them to
 * the score's bars. If a video's times don't increase, the recording is still
 * included but has no sync points.
 */

export interface SongToMpakResult {
  bytes: Uint8Array;
  /** One line per video that was left without sync points, and why. */
  skipped: string[];
}

export async function buildMpakForSong({
  song,
  tab,
  allVideos = false
}: {
  song: SelectedSong;
  tab: Uint8Array;
  /** Include every synced video, not just the primary full mix, backing track and solo. */
  allVideos?: boolean;
}): Promise<SongToMpakResult> {
  const skipped: string[] = [];

  // Main video first, so it is the default; the sort is stable.
  const ranked = [...(song.syncSets ?? [])].sort((a, b) => rank(a) - rank(b));
  const sets = allVideos ? ranked : primarySets(ranked);
  const seen: Record<string, number> = {};

  // The tab site can serve one video twice with slightly different points. Keep
  // both as recordings (spec section 7), unless the points are identical.
  const byVideo = new Map<string, { label: string; points: string }>();

  const recordings: MpakRecordingInput[] = [];
  for (const set of sets) {
    const kind = kindOf(set);
    const points = JSON.stringify(set.points);
    const earlier = byVideo.get(set.videoId);
    if (earlier?.points === points) continue;
    let label: string;
    if (earlier) {
      label = `${earlier.label} (alternate sync)`;
    } else {
      seen[kind] = (seen[kind] ?? 0) + 1;
      label = labelFor(set, seen[kind], song);
      byVideo.set(set.videoId, { label, points });
    }
    const meta = {
      feature: set.feature,
      tracks: set.tracks,
      trackNames: trackNamesFor(set, song)
    };
    const problem = pointsProblem(set.points);
    if (problem) skipped.push(`${set.videoId}: ${problem}`);
    recordings.push({
      videoId: set.videoId,
      label,
      ...(problem ? {} : { points: set.points }),
      sync: {
        revisionId: set.revisionId,
        id: set.id,
        revisionToVideoId: set.revisionToVideoId
      },
      ...meta
    });
  }

  const bytes = await buildMpak({
    title: song.title,
    artist: song.artist,
    tab: { bytes: tab, name: buildFileNameFromSongName(song.title, '.gp') },
    recordings,
    songId: song.songId,
    generator: { name: 'songsterr-downloader' }
  });

  return { bytes, skipped };
}

// The primary full mix (else its first alternative), the primary backing track
// and the primary solo video. Takes the sorted list, so the first of each kind
// is the primary. If none exists, keeps the first video so the pack still has a
// recording.
function primarySets(sorted: SongsterrSyncSet[]): SongsterrSyncSet[] {
  const full =
    sorted.find((set) => kindOf(set) === 'main') ??
    sorted.find((set) => kindOf(set) === 'alternative');
  const backing = sorted.find((set) => kindOf(set) === 'backing');
  const solo = sorted.find((set) => kindOf(set) === 'solo');
  const picked = [full, backing, solo].filter((set) => set !== undefined);
  return picked.length > 0 ? picked : sorted.slice(0, 1);
}

/*
 * How the tab player reads a video's `feature`: none is the
 * song's main video (the full mix); "alternative" is another copy of it (for
 * other regions); "backing" is the mix without the listed tracks; "solo" is
 * the solo version for the listed tracks; "playthrough" is a player video.
 */
const KIND_ORDER = ['main', 'alternative', 'backing', 'solo', 'playthrough'];

function kindOf(set: SongsterrSyncSet): string {
  return set.feature && KIND_ORDER.includes(set.feature)
    ? set.feature
    : set.feature || 'main';
}

function rank(set: SongsterrSyncSet): number {
  const index = KIND_ORDER.indexOf(kindOf(set));
  return index === -1 ? KIND_ORDER.length : index;
}

// The names the converter gives the tracks in the .gp file, so a reader can
// check the indexes against the score. Left out unless every index resolves.
function trackNamesFor(
  set: SongsterrSyncSet,
  song: SelectedSong
): string[] | undefined {
  if (!set.tracks?.length) return undefined;
  const names = set.tracks.map((i) => {
    const track = song.tracks[i];
    return track?.title || track?.name;
  });
  return names.every(Boolean) ? (names as string[]) : undefined;
}

function labelFor(
  set: SongsterrSyncSet,
  number: number,
  song: SelectedSong
): string {
  const names = (set.tracks ?? [])
    .map((i) => song.tracks[i])
    .filter(Boolean)
    .map((track) => track.name || track.title)
    .filter(Boolean);
  const list =
    names.length > 3
      ? `${names.slice(0, 3).join(', ')} +${names.length - 3}`
      : names.join(', ');
  switch (kindOf(set)) {
    case 'main':
      return 'Full mix';
    case 'alternative':
      return `Full mix (alternative ${number})`;
    case 'backing':
      return list ? `Backing track (without ${list})` : 'Backing track';
    case 'solo':
      return list ? `Solo (${list})` : 'Solo';
    case 'playthrough':
      return 'Playthrough';
    default:
      return `${kindOf(set)} ${number}`;
  }
}

// Seconds, from 0 or more, increasing (spec section 9, number form).
function pointsProblem(points: number[]): string | null {
  const increasing = points.every(
    (time, i) => time >= 0 && (i === 0 || time > points[i - 1])
  );
  return increasing ? null : 'Times are not increasing';
}
