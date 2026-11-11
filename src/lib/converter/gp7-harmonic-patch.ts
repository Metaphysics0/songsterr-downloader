import { unzipSync, zipSync } from 'fflate';

const GPIF_PATH = 'Content/score.gpif';

const NOTE_PATTERN = /<Note\b.*?<\/Note>/gs;
const HARMONIC_TYPE_PATTERN = /<Property name="HarmonicType"><HType>([^<]+)<\/HType><\/Property>/;
const CONCERT_PITCH_PATTERN =
  /<Property name="ConcertPitch"><Pitch>([\s\S]*?)<\/Pitch><\/Property>/;
const MIDI_PATTERN = /<Property name="Midi"><Number>(\d+)<\/Number><\/Property>/;
const STEP_PATTERN = /<Step>([A-G])<\/Step>/;
const OCTAVE_PATTERN = /<Octave>(-?\d+)<\/Octave>/;
const ACCIDENTAL_PATTERN = /<Accidental>([^<]*)<\/Accidental>/;

const STEP_SEMITONES: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};
const ACCIDENTAL_SEMITONES: Record<string, number> = {
  '': 0, '#': 1, x: 2, b: -1, bb: -2,
};

/**
 * Guitar Pro 7 stores the *fretted* pitch of a note in <Property name="Midi">
 * and derives the sounding pitch of a harmonic from HarmonicType/HarmonicFret
 * (Midi is the base the overtone offset is added to).
 *
 * alphaTab's Gp7Exporter instead writes note.realValue — the *sounding* pitch
 * (fretted pitch + harmonic offset). Readers then apply the overtone a second
 * time (MuseScore 4 collapses the artificial-harmonic pair into two unison
 * noteheads; Guitar Pro shows/plays the note an octave+ off).
 *
 * This patch rewrites Midi of every harmonic note to its ConcertPitch value.
 * alphaTab writes ConcertPitch from note.realValueWithoutHarmonic — the
 * fretted position — using octave = floor(midi / 12), so the real midi key
 * of a <Pitch> is Octave * 12 + step + accidental.
 *
 * Playback stays correct: alphaTab-generated MIDI uses the model (sounding
 * pitch) and is not affected, and GP/MuseScore recompute the sounding pitch
 * from the fixed base + HarmonicFret.
 */
export function patchHarmonicNotesInGpif(gpif: string): string {
  return gpif.replace(NOTE_PATTERN, (note) => {
    const harmonicType = note.match(HARMONIC_TYPE_PATTERN);
    if (!harmonicType || harmonicType[1].toLowerCase() === 'noharmonic') {
      return note;
    }
    const concertPitch = note.match(CONCERT_PITCH_PATTERN);
    const midi = note.match(MIDI_PATTERN);
    if (!concertPitch || !midi) {
      return note;
    }
    const frettedMidi = pitchXmlToMidi(concertPitch[1]);
    if (frettedMidi == null || frettedMidi === parseInt(midi[1], 10)) {
      return note;
    }
    return note.replace(
      midi[0],
      `<Property name="Midi"><Number>${frettedMidi}</Number></Property>`,
    );
  });
}

function pitchXmlToMidi(pitchXml: string): number | null {
  const step = pitchXml.match(STEP_PATTERN);
  const octave = pitchXml.match(OCTAVE_PATTERN);
  if (!step || !octave) {
    return null;
  }
  const accidental = pitchXml.match(ACCIDENTAL_PATTERN);
  const semitones =
    STEP_SEMITONES[step[1]] + ACCIDENTAL_SEMITONES[accidental?.[1] ?? ''];
  if (Number.isNaN(semitones)) {
    return null;
  }
  return parseInt(octave[1], 10) * 12 + semitones;
}

/**
 * Re-zips an exported GP7 with harmonic-note Midi values fixed.
 * Returns the original bytes untouched when there are no harmonic notes.
 */
export function patchGp7Harmonics(gp7: Uint8Array): Uint8Array {
  const entries = unzipSync(gp7);
  const gpifBytes = entries[GPIF_PATH];
  if (!gpifBytes) {
    return gp7;
  }

  const gpif = new TextDecoder().decode(gpifBytes);
  const patched = patchHarmonicNotesInGpif(gpif);
  if (patched === gpif) {
    return gp7;
  }

  entries[GPIF_PATH] = new TextEncoder().encode(patched);
  return zipSync(entries);
}
