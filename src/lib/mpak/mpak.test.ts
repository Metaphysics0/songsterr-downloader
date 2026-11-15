import { describe, expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { placeBarTimes, timesToMs, type PlayedBar } from './place-bar-times';
import { buildMpakForSong } from './song-to-mpak';
import { findSyncSets } from '$lib/songsterr/video-points';
import { parseSelectedSong } from '$lib/songsterr/tab-meta';

// Bars 0,1,2 then a repeat of bar 1: four played bars.
const bars: PlayedBar[] = [
  { barIndex: 0, occurrence: 0, seconds: 2 },
  { barIndex: 1, occurrence: 0, seconds: 2 },
  { barIndex: 2, occurrence: 0, seconds: 2 },
  { barIndex: 1, occurrence: 1, seconds: 2 }
];

describe('placeBarTimes', () => {
  it('places one time per played bar, repeats included', () => {
    expect(placeBarTimes([0, 2000, 4000, 6000], bars)).toEqual([
      { barIndex: 0, occurrence: 0, timeMs: 0 },
      { barIndex: 1, occurrence: 0, timeMs: 2000 },
      { barIndex: 2, occurrence: 0, timeMs: 4000 },
      { barIndex: 1, occurrence: 1, timeMs: 6000 }
    ]);
  });

  it('places one time per bar without repeats on first passes', () => {
    const info = {};
    const points = placeBarTimes([0, 2000, 4000], bars, info);
    expect(points.map((p) => p.barIndex)).toEqual([0, 1, 2]);
    expect(info).toEqual({ firstPassOnly: true });
  });

  it('refuses a count that fits nothing', () => {
    expect(() => placeBarTimes([0, 1000], bars)).toThrow(/plays 4/);
  });

  it('keeps times strictly increasing', () => {
    const points = placeBarTimes([0, 0, 0, 5], bars);
    expect(points.map((p) => p.timeMs)).toEqual([0, 1, 2, 5]);
  });
});

describe('timesToMs', () => {
  it('reads seconds and milliseconds', () => {
    expect(timesToMs([0, 1.5, 3])).toEqual([0, 1500, 3000]);
    expect(timesToMs([0, 1500, 3000])).toEqual([0, 1500, 3000]);
  });
});

describe('buildMpakForSong', () => {
  const song = parseSelectedSong({
    songId: 1,
    revisionId: 2,
    image: 'img',
    title: 'Song',
    artist: 'Artist',
    tracks: [{ partId: 0, instrumentId: 30 }],
    syncSets: [
      { videoId: 'AAAAAAAAAAA', points: [0, 2, 4, 6] },
      { videoId: 'BBBBBBBBBBB', points: [0, 2] },
      { videoId: 'bad', points: [0, 2, 4, 6] }
    ]
  });

  it('writes the tab, every valid video, and sync only where it fits', async () => {
    const tab = Uint8Array.from([1, 2, 3, 4]);
    const { bytes, skipped } = await buildMpakForSong({
      song,
      tab,
      playedBars: bars
    });

    const files = unzipSync(bytes);
    expect(Object.keys(files)).toEqual([
      'manifest.json',
      'score/song.gp',
      'sync/v1.json'
    ]);
    expect(files.mimetype).toBeUndefined();
    expect(Array.from(files['score/song.gp'])).toEqual([1, 2, 3, 4]);

    const manifest = JSON.parse(strFromU8(files['manifest.json']));
    expect(manifest.scores[0].format).toBe('gp');
    expect(manifest.scores[0].sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(manifest.recordings.map((r: any) => r.sources[0].videoId)).toEqual([
      'AAAAAAAAAAA',
      'BBBBBBBBBBB'
    ]);
    expect(manifest.recordings[0].sync).toEqual({ main: 'sync/v1.json' });
    expect(manifest.recordings[1].sync).toBeUndefined();
    expect(manifest.defaultRecording).toBeUndefined();
    expect(skipped).toHaveLength(1);

    const sync = JSON.parse(strFromU8(files['sync/v1.json']));
    expect(sync.anchorType).toBe('bar');
    expect(sync.score).toBe('main');
    expect(sync.points[3]).toEqual({
      timeMs: 6000,
      bar: 1,
      occurrence: 1,
      pos: 0
    });
  });

  it('writes a tab-only file when no video is synced', async () => {
    const { bytes } = await buildMpakForSong({
      song: { ...song, syncSets: undefined },
      tab: Uint8Array.from([9]),
      playedBars: bars
    });
    const manifest = JSON.parse(strFromU8(unzipSync(bytes)['manifest.json']));
    expect(manifest.recordings).toBeUndefined();
  });
});

describe('every Songsterr video is kept', () => {
  const entry = (videoId: string, extra = {}) => ({
    videoId,
    points: [0, 2, 4, 6],
    ...extra
  });
  const base = {
    songId: 1,
    revisionId: 2,
    image: 'img',
    title: 'Song',
    artist: 'Artist',
    tracks: [
      { partId: 0, instrumentId: 30, name: 'Lead' },
      { partId: 1, instrumentId: 1024, name: 'Drums' }
    ]
  };

  it('keeps more than 20 videos and repeats of one video with different points', () => {
    const many = Array.from({ length: 40 }, (_, i) =>
      entry(`video${String(i).padStart(6, '0')}`)
    );
    const song = parseSelectedSong({
      ...base,
      syncSets: [
        ...many,
        entry('video000000', { points: [0, 3, 6, 9] }),
        entry('video000000') // exact repeat
      ]
    });
    expect(song.syncSets).toHaveLength(41);
  });

  it('names backing videos after their tracks and records the feature', async () => {
    const song = parseSelectedSong({
      ...base,
      syncSets: [
        entry('BBBBBBBBBBB', { feature: 'backing', tracks: [1] }),
        entry('CCCCCCCCCCC', { feature: 'alternative' }),
        entry('AAAAAAAAAAA', { feature: null })
      ]
    });
    const { bytes } = await buildMpakForSong({
      song,
      tab: Uint8Array.from([1]),
      playedBars: bars
    });
    const manifest = JSON.parse(strFromU8(unzipSync(bytes)['manifest.json']));
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
    expect(manifest.defaultRecording).toBeUndefined();
    expect(manifest.recordings[2].scoreTracks).toEqual({
      main: { omits: [1], names: ['Drums'] }
    });
    expect(manifest.recordings[0].scoreTracks).toBeUndefined();
  });
});

describe('one video with several sets of points', () => {
  const base = {
    songId: 1,
    revisionId: 1,
    image: 'x',
    title: 'Song',
    artist: 'Artist',
    tracks: [{ partId: 0, instrumentId: 30 }]
  };

  it('keeps differing sets as recordings labelled as alternate sync, and drops identical ones', async () => {
    const { bytes } = await buildMpakForSong({
      song: {
        ...base,
        syncSets: [
          { videoId: 'AAAAAAAAAAA', points: [0, 2, 4, 6] },
          {
            videoId: 'AAAAAAAAAAA',
            points: [0, 2.04, 4.04, 6.04],
            feature: 'alternative'
          },
          {
            videoId: 'AAAAAAAAAAA',
            points: [0, 2, 4, 6],
            feature: 'alternative'
          }
        ]
      },
      tab: Uint8Array.from([1]),
      playedBars: bars
    });
    const manifest = JSON.parse(strFromU8(unzipSync(bytes)['manifest.json']));
    expect(manifest.recordings.map((r: any) => r.label)).toEqual([
      'Full mix',
      'Full mix (alternate sync)'
    ]);
    expect(manifest.recordings.map((r: any) => r.sync.main)).toEqual([
      'sync/v1.json',
      'sync/v2.json'
    ]);
  });
});

describe('findSyncSets', () => {
  const list = [{ videoId: 'AAAAAAAAAAA', points: [0, 1, 2] }];

  it('uses the current revision when it has points', async () => {
    const seen: string[] = [];
    const sets = await findSyncSets(7, 10, async (path) => {
      seen.push(path);
      return list;
    });
    expect(sets).toHaveLength(1);
    expect(seen).toEqual(['/api/video-points/7/10/list']);
  });

  it('falls back to older revisions, newest first', async () => {
    const seen: string[] = [];
    const sets = await findSyncSets(7, 10, async (path) => {
      seen.push(path);
      if (path.endsWith('/revisions'))
        return [{ revisionId: 3 }, { revisionId: 10 }, { revisionId: 8 }];
      return path.includes('/3/') ? list : [];
    });
    expect(sets).toHaveLength(1);
    expect(seen.at(-1)).toBe('/api/video-points/7/3/list');
    expect(seen.indexOf('/api/video-points/7/8/list')).toBeLessThan(
      seen.indexOf('/api/video-points/7/3/list')
    );
  });

  it('returns nothing when requests fail', async () => {
    expect(
      await findSyncSets(7, 10, async () => {
        throw new Error('blocked');
      })
    ).toEqual([]);
  });
});
