import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import * as alphaTab from '@coderline/alphatab';
import { SongsterrToAlphaTabConverter } from './songsterr-to-alphatab.converter';

describe('SongsterrToAlphaTabConverter', () => {
  it('exports a gp7 file from revision payloads', () => {
    const revisionFile = existsSync('data/revision-3-response-example.json')
      ? 'data/revision-3-response-example.json'
      : 'data/revision-part-guitar-0.json';
    const revision = JSON.parse(readFileSync(revisionFile, 'utf-8'));
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

  it('keeps multiple voices when present in a measure', () => {
    const converter = new SongsterrToAlphaTabConverter();
    const { data } = converter.toGp7({
      meta: {
        songId: 1,
        revisionId: 1,
        image: 'v',
        title: 'Voices',
        artist: 'Test',
        tracks: [
          {
            partId: 1,
            instrumentId: 30,
            title: 'Guitar',
            tuning: [64, 59, 55, 50, 45, 40]
          }
        ]
      },
      revisions: [
        {
          trackMeta: {
            partId: 1,
            instrumentId: 30,
            title: 'Guitar',
            tuning: [64, 59, 55, 50, 45, 40]
          },
          revision: {
            partId: 1,
            instrumentId: 30,
            tuning: [64, 59, 55, 50, 45, 40],
            measures: [
              {
                signature: [4, 4],
                voices: [
                  {
                    beats: [
                      {
                        duration: [1, 4],
                        notes: [{ string: 6, fret: 2 }]
                      }
                    ]
                  },
                  {
                    beats: [
                      {
                        duration: [1, 4],
                        notes: [{ string: 5, fret: 3 }]
                      }
                    ]
                  }
                ]
              }
            ],
            automations: {
              tempo: [{ measure: 0, position: 0, bpm: 95, type: 4 }]
            }
          }
        }
      ]
    });

    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
      data,
      new alphaTab.Settings()
    );
    const bar = score.tracks[0].staves[0].bars[0];
    expect(bar.voices.length).toBe(2);
    expect(bar.voices[0].beats[0].notes[0].fret).toBe(2);
    expect(bar.voices[1].beats[0].notes[0].fret).toBe(3);
  });
});
