# Songsterr → GP7 Converter

Converts Songsterr revision JSON into Guitar Pro 7 files via `@coderline/alphatab`.

## Features

- Multi-track support (guitar, bass, drums, keys, etc.)
- Time signatures, tempo changes, repeats, alternate endings, and section markers
- Note effects: bends, slides, harmonics, hammer-ons/pull-offs, vibrato, palm mute, ghost notes, staccato, accents, dead notes
- Tuplets (triplets, quintuplets, etc.)
- Multiple voices per measure
- Correct string tuning per track
- Percussion with proper MIDI articulation mapping (kick, snare, hi-hat, crashes, etc.)

## Key mapping details

### String numbering

Songsterr and alphaTab use **opposite** string ordering:

- Songsterr: `string 0` = highest pitch (high e), `string 5` = lowest pitch (low E)
- alphaTab: `string 1` = lowest pitch (low E), `string 6` = highest pitch (high e)

Formula: `note.string = numStrings - songsterrString`

### MIDI channels

Each non-drum track gets a unique MIDI channel (0-8, 10-15). Channel 9 is reserved for percussion per the MIDI spec. Without unique channels, program change messages collide and all tracks play the same instrument sound.

### Percussion articulations

GP7 references drum sounds by **index** into an articulation list, not by MIDI note number. alphaTab's default list has 95 entries (Snare=0, Kick=8, Crash=22, etc.). The converter builds a MIDI-to-index lookup dynamically via a one-time round-trip export/reimport of a dummy percussion track. This stays correct across alphaTab versions.

That lookup **must be built before score construction starts** (`buildScore` calls `ensurePercussionIndexMap()` up front). Building it lazily from inside `mapNote` — i.e. while a score is already being assembled — corrupts the in-progress score: every bar ends up with duplicated voices and a duplicated set of beats, where the first copy carries no articulations. Those silent beats fill the measure, so the real drum beats land past the bar end and never sound. Because the map is cached in module state, only the _first_ conversion per process was affected, which made it look intermittent (every cold serverless invocation shipped a broken file, every warm one was fine).

### RSE sounds

alphaTab's `Gp7Exporter` writes every track for Guitar Pro's MIDI engine (`<AudioEngineState>MIDI</AudioEngineState>`, sound path `Midi/{program}`), so Guitar Pro plays our files with General MIDI sounds. `gp7-rse-patch.ts` switches each track to RSE, using the sound Guitar Pro itself assigns to that MIDI program: sound path, soundbank patch and effect chain. Songsterr's own `.gp` downloads use the same sounds.

The sounds come from `rse-presets.json`, which `scripts/extract-gp-rse-presets.py` extracts from a local Guitar Pro 8 install: the app embeds one preset `.gp` file per GM program. GM 61 (Brass Section) has no preset, so a track using it stays on MIDI.

### Tempo

alphaTab's `buildTempoAutomation` takes a `reference` parameter that's an index (not a note denominator):

- `0` = whole note (×1), `1` = half (×0.5), **`2` = quarter (×1.0)**, `3` = dotted quarter (×1.5), `4` = half (×2.0)

Songsterr BPM is always quarter-note based, so we use `reference = 2`.

## Architecture

```
songsterr-to-alphatab.converter.ts  — main converter class
├── duration-mapper.ts              — maps Songsterr [num, den] → alphaTab Duration
├── instrument-map.ts               — maps Songsterr instrumentId → MIDI program/channel
├── gp7-percussion-patch.ts         — adds Fret/Midi to drum notes after export
├── gp7-harmonic-patch.ts           — fixes harmonic notes' Midi pitch after export
└── gp7-rse-patch.ts                — switches tracks from MIDI to RSE sounds (rse-presets.json)
```

## Gotchas

- `score.finish(settings)` must be called before export — it finalizes internal state
- Drum tracks use `staff.isPercussion = true` and `note.string = -1` (must stay < 0 so alphaTab's `isStringed` returns false)
- `note.fret` is still set for drums (for internal use) but `percussionArticulation` drives the actual sound
- Some Songsterr bend types trigger an alphaTab warning ("Unsupported bend type") — this is cosmetic and the bend still exports correctly
