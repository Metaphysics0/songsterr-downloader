import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import * as alphaTab from '@coderline/alphatab';
import { SongsterrToAlphaTabConverter } from './songsterr-to-alphatab.converter';

describe('SongsterrToAlphaTabConverter regression', () => {
  it('maps Dream Theater guitar strings, drum articulations, markers, and tempo correctly', () => {
    const meta = JSON.parse(
      readFileSync('data/state-dream-theater.json', 'utf-8')
    );
    const guitarRevision = JSON.parse(
      readFileSync('data/revision-part-guitar-0.json', 'utf-8')
    );
    const drumRevision = JSON.parse(
      readFileSync('data/revision-part-drum-0.json', 'utf-8')
    );

    const converter = new SongsterrToAlphaTabConverter();
    const { data } = converter.toGp7({
      meta: {
        songId: meta.songId,
        revisionId: meta.revisionId,
        image: meta.image,
        title: meta.title,
        artist: meta.artist,
        tracks: meta.tracks
      },
      revisions: [
        {
          trackMeta: meta.tracks.find((track: any) => track.partId === 3),
          revision: guitarRevision
        },
        {
          trackMeta: meta.tracks.find((track: any) => track.partId === 17),
          revision: drumRevision
        }
      ]
    });

    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
      data,
      new alphaTab.Settings()
    );

    // Source tempo and marker should be preserved.
    expect(score.tempo).toBe(95);
    expect(score.masterBars[0].section?.text).toBe('Intro');

    // Guitar string should be inverted from Songsterr ordering.
    const guitarTrack = score.tracks.find((track) =>
      track.name.includes('Left Guitar')
    );
    const firstGuitarNote = firstNote(guitarTrack);
    expect(firstGuitarNote?.string).toBe(2);
    expect(firstGuitarNote?.fret).toBe(2);
    expect(guitarTrack?.playbackInfo.primaryChannel).not.toBe(9);

    // Drum note should use percussion articulation, not guitar fret/string mapping.
    const drumTrack = score.tracks.find((track) =>
      track.name.includes('E-Drums')
    );
    const firstDrumNote = firstNote(drumTrack);
    expect(firstDrumNote?.percussionArticulation).toBe(42);
    expect(firstDrumNote?.fret).toBe(-1);
    expect(firstDrumNote?.string).toBe(-1);
    expect(drumTrack?.playbackInfo.primaryChannel).toBe(9);

    const drumArticulations = allPercussionArticulations(drumTrack);
    expect(drumArticulations).not.toContain(32);
    expect(drumArticulations).not.toContain(40);
    expect(drumArticulations).toContain(38);
  });
});

function firstNote(
  track: alphaTab.model.Track | undefined
): alphaTab.model.Note | null {
  if (!track) {
    return null;
  }
  for (const staff of track.staves) {
    for (const bar of staff.bars) {
      for (const voice of bar.voices) {
        for (const beat of voice.beats) {
          if (beat.notes.length > 0) {
            return beat.notes[0];
          }
        }
      }
    }
  }
  return null;
}

function allPercussionArticulations(
  track: alphaTab.model.Track | undefined
): number[] {
  if (!track) {
    return [];
  }
  const result: number[] = [];
  for (const staff of track.staves) {
    for (const bar of staff.bars) {
      for (const voice of bar.voices) {
        for (const beat of voice.beats) {
          for (const note of beat.notes) {
            if (note.percussionArticulation > 0) {
              result.push(note.percussionArticulation);
            }
          }
        }
      }
    }
  }
  return result;
}
