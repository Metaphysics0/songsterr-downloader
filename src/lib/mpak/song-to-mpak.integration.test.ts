import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { SongsterrToAlphaTabConverter } from '$lib/converter/songsterr-to-alphatab.converter';
import { buildMpakForSong } from './song-to-mpak';

describe('mpak from a converted tab', () => {
  it('puts sync points on the real played bars', async () => {
    const revisions = Array.from({ length: 9 }, (_, i) => {
      const revision = JSON.parse(
        readFileSync(`src/lib/converter/__fixtures__/song-1/${i}.json`, 'utf-8')
      );
      return {
        trackMeta: {
          partId: i,
          instrumentId: revision.instrumentId ?? 27,
          title: revision.name ?? `Track ${i}`
        },
        revision
      };
    });
    const meta = {
      songId: 1,
      revisionId: 1,
      image: 'x',
      title: 'Song 1',
      artist: 'Test',
      tracks: revisions.map((r) => r.trackMeta)
    };

    const { data, playedBars } = new SongsterrToAlphaTabConverter().toGp7(
      { meta, revisions },
      { withPlayedBars: true }
    );
    expect(playedBars!.length).toBeGreaterThan(0);
    expect(playedBars![0]).toMatchObject({ barIndex: 0, occurrence: 0 });

    // One time per played bar, 2 s apart.
    const points = playedBars!.map((_, i) => i * 2);
    const { bytes, skipped } = await buildMpakForSong({
      song: { ...meta, syncSets: [{ videoId: 'AAAAAAAAAAA', points }] },
      tab: data,
      playedBars: playedBars!
    });
    expect(skipped).toEqual([]);

    const files = unzipSync(bytes);
    const sync = JSON.parse(strFromU8(files['sync/v1.json']));
    expect(sync.points).toHaveLength(playedBars!.length);
    expect(sync.points.at(-1)).toMatchObject({
      bar: playedBars!.at(-1)!.barIndex,
      occurrence: playedBars!.at(-1)!.occurrence
    });
    expect(Array.from(files['score/song.gp'])).toEqual(Array.from(data));
  });
});
