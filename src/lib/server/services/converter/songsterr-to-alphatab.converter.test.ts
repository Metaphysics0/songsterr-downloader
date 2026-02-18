import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SongsterrToAlphaTabConverter } from './songsterr-to-alphatab.converter';

describe('SongsterrToAlphaTabConverter', () => {
  it('exports a gp7 file from revision payloads', () => {
    const revision = JSON.parse(
      readFileSync('data/revision-3-response-example.json', 'utf-8')
    );
    const converter = new SongsterrToAlphaTabConverter();

    const { data } = converter.toGp7({
      meta: {
        songId: 27,
        revisionId: 5184162,
        image: 'v5-2-1-GEwclkOmjsFXZOxQ',
        title: 'Kashmir',
        artist: 'Led Zeppelin',
        tracks: [
          {
            partId: 3,
            instrumentId: 29,
            title: 'Lead Guitar',
            tuning: [64, 59, 55, 50, 45, 40]
          }
        ]
      },
      revisions: [
        {
          trackMeta: {
            partId: 3,
            instrumentId: 29,
            title: 'Lead Guitar',
            tuning: [64, 59, 55, 50, 45, 40]
          },
          revision
        }
      ]
    });

    expect(data.length).toBeGreaterThan(0);
  });
});
