import { unzipSync, zipSync } from 'fflate';
import rsePresets from './rse-presets.json';

const GPIF_PATH = 'Content/score.gpif';

const TRACK_PATTERN = /<Track id="\d+">.*?<\/Track>/gs;
const SOUND_PATTERN = /<Sound>.*?<\/Sound>/gs;
const MIDI_PATH_PATTERN = /<Path><!\[CDATA\[Midi\/(\d+)\]\]><\/Path>/;
const DRUM_KIT_TYPE = '<Type>drumKit</Type>';
const MIDI_ENGINE = '<AudioEngineState>MIDI</AudioEngineState>';
const RSE_ENGINE = '<AudioEngineState>RSE</AudioEngineState>';

interface RsePreset {
  path: string;
  patch: string;
  pickup: number;
  effects: { id: string; params: string }[];
}

const PRESETS: Record<string, RsePreset> = rsePresets;

/**
 * alphaTab's Gp7Exporter hardcodes every track to Guitar Pro's MIDI engine:
 * <AudioEngineState>MIDI</AudioEngineState> and a <Sound> whose path is
 * "Midi/{program}". Guitar Pro then plays the file with General MIDI sounds.
 *
 * This patches each track to Guitar Pro's RSE engine using the sound Guitar Pro
 * itself assigns to that MIDI program (rse-presets.json, extracted from Guitar
 * Pro 8 by scripts/extract-gp-rse-presets.py). Songsterr's own .gp downloads use
 * the same sounds. For every "Midi/{program}" sound it:
 *   - replaces the path with the preset's RSE sound path,
 *   - adds the preset's <RSE> block (soundbank patch, pickups, effect chain),
 *   - rewrites the track's Sound automations, which reference the sound by
 *     "path;name;role",
 * and switches the track's AudioEngineState to RSE.
 *
 * A track is left untouched (still MIDI) if any of its sounds has no preset
 * (GM program 61, Brass Section), so a track never mixes engines.
 */
export function patchRseSoundsInGpif(gpif: string): string {
  return gpif.replace(TRACK_PATTERN, patchTrack);
}

function patchTrack(track: string): string {
  if (!track.includes(MIDI_ENGINE)) {
    return track;
  }
  const isDrumKit = track.includes(DRUM_KIT_TYPE);
  const presetsByProgram = new Map<string, RsePreset>();
  for (const sound of track.match(SOUND_PATTERN) ?? []) {
    const program = sound.match(MIDI_PATH_PATTERN)?.[1];
    if (program == null) {
      continue;
    }
    const preset = PRESETS[isDrumKit ? 'drums' : program];
    if (!preset) {
      return track;
    }
    presetsByProgram.set(program, preset);
  }
  if (presetsByProgram.size === 0) {
    return track;
  }

  let patched = track.replace(SOUND_PATTERN, (sound) => {
    const program = sound.match(MIDI_PATH_PATTERN)?.[1];
    const preset = program != null && presetsByProgram.get(program);
    if (!preset) {
      return sound;
    }
    return sound
      .replace(MIDI_PATH_PATTERN, `<Path><![CDATA[${preset.path}]]></Path>`)
      .replace('</Sound>', rseBlock(preset) + '</Sound>');
  });
  for (const [program, preset] of presetsByProgram) {
    // Sound automation values are "<path>;<sound name>;<role>".
    patched = patched.replaceAll(
      `<![CDATA[Midi/${program};`,
      `<![CDATA[${preset.path};`
    );
  }
  return patched.replace(MIDI_ENGINE, RSE_ENGINE);
}

function rseBlock(preset: RsePreset): string {
  const effects = preset.effects
    .map(
      (effect) =>
        `<Effect id="${effect.id}"><Parameters>${effect.params}</Parameters></Effect>`
    )
    .join('');
  return (
    '<RSE>' +
    `<SoundbankPatch>${preset.patch}</SoundbankPatch>` +
    '<Pickups>' +
    `<OverloudPosition>${preset.pickup}</OverloudPosition>` +
    '<Volumes>1 1</Volumes><Tones>1 1</Tones>' +
    '</Pickups>' +
    `<EffectChain>${effects}</EffectChain>` +
    '</RSE>'
  );
}

/**
 * Re-zips an exported GP7 with its tracks switched to RSE sounds. Returns the
 * original bytes untouched when nothing changed.
 */
export function patchGp7RseSounds(gp7: Uint8Array): Uint8Array {
  const entries = unzipSync(gp7);
  const gpifBytes = entries[GPIF_PATH];
  if (!gpifBytes) {
    return gp7;
  }

  const gpif = new TextDecoder().decode(gpifBytes);
  const patched = patchRseSoundsInGpif(gpif);
  if (patched === gpif) {
    return gp7;
  }

  entries[GPIF_PATH] = new TextEncoder().encode(patched);
  return zipSync(entries);
}
