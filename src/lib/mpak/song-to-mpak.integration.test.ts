import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { SongsterrToAlphaTabConverter } from '$lib/converter/songsterr-to-alphatab.converter';
import { buildMpakForSong } from './song-to-mpak';

describe('mpak from a converted tab', () => {
  it('packs a converted tab with its sync times', async () => {
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

    const { data } = new SongsterrToAlphaTabConverter().toGp7({
      meta,
      revisions
    });
    const points = [0, 2, 4, 6];
    const { bytes, skipped } = await buildMpakForSong({
      song: { ...meta, syncSets: [{ videoId: 'AAAAAAAAAAA', points }] },
      tab: data
    });
    expect(skipped).toEqual([]);

    const files = unzipSync(bytes);
    const sync = JSON.parse(strFromU8(files['sync/v1.json']));
    expect(sync.points).toEqual(points);
    expect(Array.from(files['score/song.gp'])).toEqual(Array.from(data));
  });
});
