import type { SelectedSong, SongsterrSyncSet } from '$lib/types';
import { buildFileNameFromSongName } from '$lib/songsterr/file-name';
import { buildMpak, type MpakRecordingInput } from './build-mpak';
import {
  placeBarTimes,
  timesToMs,
  type PlacementInfo,
  type PlayedBar
} from './place-bar-times';

/*
 * Packs a converted tab and its synced YouTube videos as a .mpak.
 * Every video becomes a recording. If a video's bar count doesn't fit the
 * tab's played bars, the recording is still included but has no sync points,
 * because points on the wrong bars are worse than none.
 */

export interface SongToMpakResult {
  bytes: Uint8Array;
  /** One line per video that was left without sync points, and why. */
  skipped: string[];
}

export async function buildMpakForSong({
  song,
  tab,
  playedBars
}: {
  song: SelectedSong;
  tab: Uint8Array;
  playedBars: PlayedBar[];
}): Promise<SongToMpakResult> {
  const skipped: string[] = [];

  // Main video first, so it is the default; the sort is stable.
  const sets = [...(song.syncSets ?? [])].sort((a, b) => rank(a) - rank(b));
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
    const info: PlacementInfo = {};
    const meta = {
      feature: set.feature,
      tracks: set.tracks,
      trackNames: trackNamesFor(set, song)
    };
    try {
      recordings.push({
        videoId: set.videoId,
        label: withPlacementNote(label, info, playedBars.length),
        points: placeBarTimes(timesToMs(set.points), playedBars, info),
        ...meta
      });
    } catch (error) {
      skipped.push(
        `${set.videoId}: ${error instanceof Error ? error.message : 'not usable'}`
      );
      recordings.push({ videoId: set.videoId, label, ...meta });
    }
  }

  const bytes = await buildMpak({
    title: song.title,
    artist: song.artist,
    tab: { bytes: tab, name: buildFileNameFromSongName(song.title, '.gp') },
    recordings,
    generator: { name: 'songsterr-downloader' }
  });

  return { bytes, skipped };
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

function withPlacementNote(
  label: string,
  info: PlacementInfo,
  bars: number
): string {
  if (info.covered) return `${label} (bars 1-${info.covered} of ${bars})`;
  if (info.extra) return `${label} (list had ${info.extra} extra bars)`;
  if (info.firstPassOnly) return `${label} (repeats not synced)`;
  return label;
}
