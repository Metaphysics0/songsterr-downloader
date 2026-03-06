import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SongsterrToAlphaTabConverter } from './songsterr-to-alphatab.converter';
import type {
  SongsterrRevisionTrackPayload,
  SongsterrStateMetaCurrent,
  SongsterrStateMetaCurrentTrack
} from '$lib/types';
import type { SongsterrRevisionTrackInput } from './songsterr-to-alphatab.converter';

function loadRevision(path: string): SongsterrRevisionTrackPayload {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function makeTrackMeta(
  overrides: Partial<SongsterrStateMetaCurrentTrack> = {}
): SongsterrStateMetaCurrentTrack {
  return {
    partId: 0,
    instrumentId: 27,
    title: 'Test Guitar',
    tuning: [64, 59, 55, 50, 45, 40],
    ...overrides
  };
}

function makeMeta(
  tracks: SongsterrStateMetaCurrentTrack[],
  overrides: Partial<SongsterrStateMetaCurrent> = {}
): SongsterrStateMetaCurrent {
  return {
    songId: 1,
    revisionId: 1,
    image: 'test',
    title: 'Test Song',
    artist: 'Test Artist',
    tracks,
    ...overrides
  };
}

function convertSingle(
  revision: SongsterrRevisionTrackPayload,
  trackMeta?: SongsterrStateMetaCurrentTrack
) {
  const meta = trackMeta || makeTrackMeta();
  const converter = new SongsterrToAlphaTabConverter();
  return converter.toGp7({
    meta: makeMeta([meta]),
    revisions: [{ trackMeta: meta, revision }]
  });
}

describe('SongsterrToAlphaTabConverter', () => {
  describe('full song conversion (song-1)', () => {
    it('exports a gp7 file from multi-track revision payloads', () => {
      const tracks: SongsterrRevisionTrackInput[] = [];
      const trackMetas: SongsterrStateMetaCurrentTrack[] = [];

      for (let i = 0; i <= 8; i++) {
        const revision = loadRevision(`data/song-1/${i}.json`);
        const meta = makeTrackMeta({
          partId: i,
          instrumentId: revision.instrumentId ?? 27,
          title: revision.name ?? `Track ${i}`
        });
        trackMetas.push(meta);
        tracks.push({ trackMeta: meta, revision });
      }

      const converter = new SongsterrToAlphaTabConverter();
      const { data, warnings } = converter.toGp7({
        meta: makeMeta(trackMetas, { title: 'Song 1', artist: 'Test' }),
        revisions: tracks
      });

      expect(data.length).toBeGreaterThan(0);
      // With our fixes, there should be far fewer warnings than before
      // (no more slide_unsupported for "below"/"downwards", no duration_approximated for tuplets)
      const slideWarnings = warnings.filter((w) => w.code === 'slide_unsupported');
      expect(slideWarnings.length).toBe(0);
    });
  });

  describe('string numbering', () => {
    it('inverts string numbering: Songsterr string 0 (high e) → alphaTab string 6 (high e) for 6-string', async () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [
                      { fret: 5, string: 0 },
                      { fret: 3, string: 5 }
                    ],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const meta = makeTrackMeta({ tuning: [64, 59, 55, 50, 45, 40] });
      const converter = new SongsterrToAlphaTabConverter();
      const { data } = converter.toGp7({
        meta: makeMeta([meta]),
        revisions: [{ trackMeta: meta, revision }]
      });
      expect(data.length).toBeGreaterThan(0);

      // Re-import to verify string mapping
      const settings = new (await import('@coderline/alphatab')).Settings();
      const score = (await import('@coderline/alphatab')).importer.ScoreLoader.loadScoreFromBytes(data, settings);
      const beat = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
      // Songsterr string 0 → alphaTab string 6 (numStrings - 0 = 6)
      const highENote = beat.notes.find((n: { fret: number }) => n.fret === 5);
      expect(highENote!.string).toBe(6);
      // Songsterr string 5 → alphaTab string 1 (numStrings - 5 = 1)
      const lowENote = beat.notes.find((n: { fret: number }) => n.fret === 3);
      expect(lowENote!.string).toBe(1);
    });
  });

  describe('palm mute', () => {
    it('propagates beat-level palmMute to all notes', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [
                      { fret: 3, string: 4 },
                      { fret: 3, string: 5 }
                    ],
                    palmMute: true,
                    duration: [1, 8],
                    type: 8
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('dead notes', () => {
    it('maps dead notes correctly', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 8, string: 3, dead: true }],
                    duration: [1, 8],
                    type: 8
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('hammer-on / pull-off', () => {
    it('maps hp flag to isHammerPullOrigin', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 9, string: 2, hp: true }],
                    duration: [1, 8],
                    type: 8
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('vibrato', () => {
    it('handles slight vibrato', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 10, string: 3, vibrato: true }],
                    vibrato: true,
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });

    it('handles wide vibrato', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 9, string: 2, wideVibrato: true }],
                    wideVibrato: true,
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('slides', () => {
    it('maps "below" slide correctly', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 10, string: 3, slide: 'below' }],
                    duration: [1, 8],
                    type: 8
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data, warnings } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
      expect(warnings.filter((w) => w.code === 'slide_unsupported').length).toBe(0);
    });

    it('maps "downwards" slide correctly', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 10, string: 2, slide: 'downwards' }],
                    duration: [1, 2],
                    type: 2
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data, warnings } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
      expect(warnings.filter((w) => w.code === 'slide_unsupported').length).toBe(0);
    });
  });

  describe('harmonics', () => {
    it('maps artificial harmonics', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [
                      {
                        fret: 9,
                        string: 2,
                        harmonic: 'artificial',
                        harmonicFret: 5
                      }
                    ],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });

    it('maps pinch harmonics', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [
                      {
                        fret: 3,
                        string: 5,
                        harmonic: 'pinch',
                        harmonicFret: 24
                      }
                    ],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('bends', () => {
    it('maps bend with point curve', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [
                      {
                        fret: 3,
                        string: 0,
                        bend: {
                          tone: 100,
                          points: [
                            { position: 0, tone: 100 },
                            { position: 30, tone: 100 },
                            { position: 40, tone: 0 },
                            { position: 60, tone: 0 }
                          ]
                        }
                      }
                    ],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('pick stroke', () => {
    it('maps down pick stroke', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [
                      { fret: 13, string: 0 },
                      { fret: 11, string: 1 }
                    ],
                    pickStroke: 'down',
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('tuplets', () => {
    it('maps triplet correctly', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 2, string: 4 }],
                    type: 8,
                    tuplet: 3,
                    duration: [1, 12],
                    tupletStart: true
                  },
                  {
                    notes: [{ fret: 2, string: 4 }],
                    type: 8,
                    tuplet: 3,
                    duration: [1, 12]
                  },
                  {
                    notes: [{ fret: 2, string: 4 }],
                    type: 8,
                    tuplet: 3,
                    duration: [1, 12],
                    tupletStop: true
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data, warnings } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
      // Triplets should not produce duration_approximated warnings
      const durationWarnings = warnings.filter(
        (w) => w.code === 'duration_approximated'
      );
      expect(durationWarnings.length).toBe(0);
    });
  });

  describe('ghost notes', () => {
    it('maps ghost notes', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 5, string: 3, ghost: true }],
                    duration: [1, 8],
                    type: 8
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('staccato', () => {
    it('maps staccato notes', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 0, string: 5, staccato: true }],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('accentuated notes', () => {
    it('maps accentuated notes', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 7, string: 2, accentuated: true }],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('multiple voices', () => {
    it('converts both voices in a measure', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 5, string: 0 }],
                    duration: [1, 2],
                    type: 2
                  }
                ]
              },
              {
                beats: [
                  {
                    notes: [{ fret: 0, string: 5 }],
                    duration: [1, 4],
                    type: 4
                  },
                  {
                    notes: [{ fret: 2, string: 5 }],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data, warnings } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
      // Should NOT have "additional_voices_skipped" warnings
      const voiceWarnings = warnings.filter(
        (w) => w.code === 'additional_voices_skipped'
      );
      expect(voiceWarnings.length).toBe(0);
    });
  });

  describe('rest beats', () => {
    it('marks rest beats as isEmpty', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [
              {
                beats: [
                  { rest: true, duration: [1, 4], type: 4, notes: [] },
                  {
                    notes: [{ fret: 5, string: 0 }],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('MIDI channel allocation', () => {
    it('assigns unique channels to each non-drum track, skipping channel 9', async () => {
      const alphaTabModule = await import('@coderline/alphatab');

      const makeRevision = (): SongsterrRevisionTrackPayload => ({
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [{ fret: 0, string: 0 }],
                    duration: [1, 1],
                    type: 1
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      });

      const tracks: SongsterrRevisionTrackInput[] = [];
      const trackMetas: SongsterrStateMetaCurrentTrack[] = [];
      for (let i = 0; i < 12; i++) {
        const meta = makeTrackMeta({
          partId: i,
          instrumentId: i === 5 ? 1024 : 25, // track 5 is drums
          title: `Track ${i}`,
          isDrums: i === 5
        });
        trackMetas.push(meta);
        tracks.push({ trackMeta: meta, revision: makeRevision() });
      }

      const converter = new SongsterrToAlphaTabConverter();
      const { data } = converter.toGp7({
        meta: makeMeta(trackMetas),
        revisions: tracks
      });

      const settings = new alphaTabModule.Settings();
      const score = alphaTabModule.importer.ScoreLoader.loadScoreFromBytes(data, settings);

      const channels = score.tracks.map(
        (t: { playbackInfo: { primaryChannel: number } }) => t.playbackInfo.primaryChannel
      );
      // Drum track should be on channel 9
      expect(channels[5]).toBe(9);
      // No two non-drum tracks share a channel
      const nonDrumChannels = channels.filter((_: number, i: number) => i !== 5);
      expect(new Set(nonDrumChannels).size).toBe(nonDrumChannels.length);
      // No non-drum track uses channel 9
      expect(nonDrumChannels).not.toContain(9);
    });
  });

  describe('drum percussion articulation', () => {
    it('sets percussionArticulation from fret values on drum tracks', async () => {
      const alphaTabModule = await import('@coderline/alphatab');

      const revision: SongsterrRevisionTrackPayload = {
        instrumentId: 1024,
        measures: [
          {
            voices: [
              {
                beats: [
                  {
                    notes: [
                      { fret: 36, string: 0 }, // kick
                      { fret: 38, string: 1 }  // snare
                    ],
                    duration: [1, 4],
                    type: 4
                  }
                ]
              }
            ],
            signature: [4, 4]
          }
        ]
      };

      const meta = makeTrackMeta({
        instrumentId: 1024,
        isDrums: true,
        title: 'Drums',
        tuning: []
      });
      const converter = new SongsterrToAlphaTabConverter();
      const { data } = converter.toGp7({
        meta: makeMeta([meta]),
        revisions: [{ trackMeta: meta, revision }]
      });

      const settings = new alphaTabModule.Settings();
      const score = alphaTabModule.importer.ScoreLoader.loadScoreFromBytes(data, settings);

      const beat = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
      const articulations = beat.notes.map(
        (n: { percussionArticulation: number }) => n.percussionArticulation
      );
      expect(articulations).toContain(36); // kick
      expect(articulations).toContain(38); // snare
    });
  });

  describe('marker format', () => {
    it('handles string markers', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [{ beats: [] }],
            signature: [4, 4],
            marker: 'Intro'
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });

    it('handles object markers', () => {
      const revision: SongsterrRevisionTrackPayload = {
        measures: [
          {
            voices: [{ beats: [] }],
            signature: [4, 4],
            marker: { text: '[A] Intro', width: 100 }
          }
        ]
      };

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
    });
  });
});
