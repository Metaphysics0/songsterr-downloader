import { unzipSync, zipSync } from 'fflate';

const GPIF_PATH = 'Content/score.gpif';

const INSTRUMENT_SET_PATTERN = /<InstrumentSet>(.*?)<\/InstrumentSet>/gs;
const ARTICULATION_PATTERN = /<Articulation>.*?<\/Articulation>/gs;
const OUTPUT_MIDI_PATTERN = /<OutputMidiNumber>(\d+)<\/OutputMidiNumber>/;
const NOTE_PATTERN = /<Note\b.*?<\/Note>/gs;
const ARTICULATION_INDEX_PATTERN =
  /<InstrumentArticulation>(\d+)<\/InstrumentArticulation>/;
const STRING_PROPERTY = '<Property name="String">';

/**
 * Guitar Pro places a percussion note on the drum staff only when the note
 * carries <Fret>/<Midi> properties. alphaTab's Gp7Exporter writes those only
 * for stringed (and piano) notes, so GP7 drum tracks exported through alphaTab
 * open as empty in Guitar Pro.
 *
 * This patches the exported GPIF, injecting
 *   <Property name="Fret"><Fret>{midi}</Fret></Property>
 *   <Property name="Midi"><Number>{midi}</Number></Property>
 * into every note that references a drum kit articulation (it has an
 * <InstrumentArticulation> and no String property), where {midi} is the drum
 * sound's MIDI number declared by the kit articulation's <OutputMidiNumber>.
 */
export function patchPercussionNotesInGpif(gpif: string): string {
  const articulationMidi = buildDrumKitMidiMap(gpif);
  if (articulationMidi.length === 0) {
    return gpif;
  }

  return gpif.replace(NOTE_PATTERN, (note) => {
    if (note.includes(STRING_PROPERTY)) {
      return note; // stringed note — already carries Fret/Midi
    }
    const articulation = note.match(ARTICULATION_INDEX_PATTERN);
    if (!articulation) {
      return note;
    }
    const midi = articulationMidi[parseInt(articulation[1], 10)];
    if (midi == null) {
      return note;
    }
    const properties =
      `<Property name="Fret"><Fret>${midi}</Fret></Property>` +
      `<Property name="Midi"><Number>${midi}</Number></Property>`;
    return note.replace('</Properties>', properties + '</Properties>');
  });
}

/**
 * Maps percussion articulation index → output MIDI number for the file's drum
 * kit (multi-track files have one InstrumentSet per track, so pick the
 * drumKit). Returns an empty list when the file has no drum track.
 */
function buildDrumKitMidiMap(gpif: string): (number | null)[] {
  for (const match of gpif.matchAll(INSTRUMENT_SET_PATTERN)) {
    const instrumentSet = match[1];
    if (!instrumentSet.includes('<Type>drumKit</Type>')) {
      continue;
    }
    const midiByArticulationIndex: (number | null)[] = [];
    for (const articulation of instrumentSet.matchAll(ARTICULATION_PATTERN)) {
      const midi = articulation[0].match(OUTPUT_MIDI_PATTERN);
      midiByArticulationIndex.push(midi ? parseInt(midi[1], 10) : null);
    }
    return midiByArticulationIndex;
  }
  return [];
}

/**
 * Re-zips an exported GP7 with Fret/Midi injected into percussion notes.
 * Returns the original bytes untouched when the file has no drum track.
 */
export function patchGp7Percussion(gp7: Uint8Array): Uint8Array {
  const entries = unzipSync(gp7);
  const gpifBytes = entries[GPIF_PATH];
  if (!gpifBytes) {
    return gp7;
  }

  const gpif = new TextDecoder().decode(gpifBytes);
  const patched = patchPercussionNotesInGpif(gpif);
  if (patched === gpif) {
    return gp7;
  }

  entries[GPIF_PATH] = new TextEncoder().encode(patched);

  // fflate preserves directory entries (trailing "/") so the re-packed zip
  // keeps the layout Guitar Pro expects.
  return zipSync(entries);
}
