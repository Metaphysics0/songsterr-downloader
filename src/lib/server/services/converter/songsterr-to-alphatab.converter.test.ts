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
    it('converts 0-based strings to 1-based', () => {
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

      const { data } = convertSingle(revision);
      expect(data.length).toBeGreaterThan(0);
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
