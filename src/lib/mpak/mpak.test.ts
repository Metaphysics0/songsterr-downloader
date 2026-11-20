import { describe, expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { buildMpakForSong } from './song-to-mpak';
import { sha256Hex } from './build-mpak';
import { findSyncSets } from '$lib/songsterr/video-points';
import { parseSelectedSong } from '$lib/songsterr/tab-meta';

const tab = Uint8Array.from([1, 2, 3, 4]);
const points = [0, 2, 4, 6];

const makeSong = (syncSets: unknown[]) =>
  parseSelectedSong({
    songId: 4,
    revisionId: 10,
    image: 'img',
    title: 'Song',
    artist: 'Artist',
    tracks: [
      { partId: 0, instrumentId: 30, name: 'Lead' },
      { partId: 1, instrumentId: 1024, name: 'Drums' }
    ],
    syncSets
  });

async function build(
  song: Parameters<typeof buildMpakForSong>[0]['song'],
  allVideos = true
) {
  const { bytes, skipped } = await buildMpakForSong({ song, tab, allVideos });
  const files = unzipSync(bytes);
  const manifest = JSON.parse(strFromU8(files['manifest.json']));
  return { files, manifest, skipped };
}

describe('buildMpakForSong', () => {
  it('writes the tab, every valid video, and sync only where it fits', async () => {
    const { files, manifest, skipped } = await build(
      makeSong([
        {
          videoId: 'AAAAAAAAAAA',
          points,
          id: 7,
          revisionId: 9,
          revisionToVideoId: 8
        },
        { videoId: 'BBBBBBBBBBB', points: [0, 2, 2, 6] },
        { videoId: 'bad', points }
      ])
    );

    expect(Object.keys(files)).toEqual([
      'manifest.json',
      'score/song.gp',
      'sync/v1.json'
    ]);
    expect(Array.from(files['score/song.gp'])).toEqual(Array.from(tab));

    expect(manifest.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(manifest.scores[0]).toMatchObject({
      format: 'gp',
      size: tab.length,
      origin: 'Songsterr'
    });
    expect(manifest.scores[0].sha256).toBe(await sha256Hex(tab));
    // The size and hash of each sync file (spec section 4, "Integrity").
    expect(Object.keys(manifest.entries)).toEqual(['sync/v1.json']);
    expect(manifest.entries['sync/v1.json']).toEqual({
      size: files['sync/v1.json'].length,
      sha256: await sha256Hex(files['sync/v1.json'])
    });
    expect(manifest.recordings.map((r: any) => r.sources[0].videoId)).toEqual([
      'AAAAAAAAAAA',
      'BBBBBBBBBBB'
    ]);
    expect(manifest.recordings[0].sync).toEqual({ main: 'sync/v1.json' });
    expect(manifest.recordings[1].sync).toBeUndefined();
    expect(manifest.defaultRecording).toBeUndefined();
    expect(skipped).toEqual(['BBBBBBBBBBB: Times are not increasing']);

    expect(JSON.parse(strFromU8(files['sync/v1.json']))).toMatchObject({
      version: 1,
      score: 'main',
      anchorType: 'bar',
      videoId: 'AAAAAAAAAAA',
      revisionId: 9,
      'x-songsterr-songId': 4,
      'x-songsterr-id': 7,
      'x-songsterr-revisionToVideoId': 8,
      points
    });
  });

  it('writes a tab-only file when no video is synced', async () => {
    const { manifest } = await build({ ...makeSong([]), syncSets: undefined });
    expect(manifest.recordings).toBeUndefined();
  });

  it('names backing videos after their tracks and records the feature', async () => {
    const { manifest } = await build(
      makeSong([
        { videoId: 'BBBBBBBBBBB', points, feature: 'backing', tracks: [1] },
        { videoId: 'CCCCCCCCCCC', points, feature: 'alternative' },
        { videoId: 'AAAAAAAAAAA', points, feature: null }
      ])
    );
    expect(manifest.recordings.map((r: any) => r.role)).toEqual([
      'original',
      'alternate',
      'backing'
    ]);
    expect(manifest.recordings.map((r: any) => r.label)).toEqual([
      'Full mix',
      'Full mix (alternative 1)',
      'Backing track (without Drums)'
    ]);
    expect(manifest.recordings[2].scoreTracks).toEqual({
      main: { omits: [1], names: ['Drums'] }
    });
    expect(manifest.recordings[0].scoreTracks).toBeUndefined();
  });

  it('keeps differing sets of one video as alternate sync, and drops identical ones', async () => {
    // Not parsed, so the builder's own handling of repeats is what is tested.
    const song = makeSong([]);
    const { manifest } = await build({
      ...song,
      syncSets: [
        { videoId: 'AAAAAAAAAAA', points },
        {
          videoId: 'AAAAAAAAAAA',
          points: [0, 2.04, 4.04, 6.04],
          feature: 'alternative'
        },
        { videoId: 'AAAAAAAAAAA', points, feature: 'alternative' }
      ]
    });
    expect(manifest.recordings.map((r: any) => r.label)).toEqual([
      'Full mix',
      'Full mix (alternate sync)'
    ]);
    expect(manifest.recordings.map((r: any) => r.sync.main)).toEqual([
      'sync/v1.json',
      'sync/v2.json'
    ]);
  });

  it('keeps only the primary full mix, backing track and solo by default', async () => {
    const song = makeSong([
      { videoId: 'AAAAAAAAAAA', points },
      { videoId: 'BBBBBBBBBBB', points, feature: 'backing' },
      { videoId: 'CCCCCCCCCCC', points, feature: 'backing' },
      { videoId: 'DDDDDDDDDDD', points, feature: 'solo' },
      { videoId: 'EEEEEEEEEEE', points, feature: 'solo' }
    ]);
    const labels = async (allVideos: boolean) =>
      (await build(song, allVideos)).manifest.recordings.map(
        (r: any) => r.label
      );
    expect(await labels(false)).toEqual(['Full mix', 'Backing track', 'Solo']);
    expect(await labels(true)).toHaveLength(5);
  });
});

describe('findSyncSets', () => {
  const list = [{ videoId: 'AAAAAAAAAAA', points: [0, 1, 2], status: 'done' }];
  const pending = { ...list[0], status: 'pending' };

  it('reads the list of the given revision and no other', async () => {
    const seen: string[] = [];
    const sets = await findSyncSets(7, 10, async (path) => {
      seen.push(path);
      return list;
    });
    expect(sets).toHaveLength(1);
    expect(seen).toEqual(['/api/video-points/7/10/list']);
  });

  it('ignores entries that are not done', async () => {
    expect(
      await findSyncSets(7, 10, async () => [pending, ...list])
    ).toHaveLength(1);
    expect(await findSyncSets(7, 10, async () => [pending])).toEqual([]);
  });

  it('returns nothing when requests fail', async () => {
    expect(
      await findSyncSets(7, 10, async () => {
        throw new Error('blocked');
      })
    ).toEqual([]);
  });
});
