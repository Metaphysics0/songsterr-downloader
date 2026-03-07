# Songsterr → GP7 Converter

Converts Songsterr revision JSON into Guitar Pro 7 files via `@coderline/alphatab`.

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

### Tempo

alphaTab's `buildTempoAutomation` takes a `reference` parameter that's an index (not a note denominator):
- `0` = whole note (×1), `1` = half (×0.5), **`2` = quarter (×1.0)**, `3` = dotted quarter (×1.5), `4` = half (×2.0)

Songsterr BPM is always quarter-note based, so we use `reference = 2`.

## Architecture

```
songsterr-to-alphatab.converter.ts  — main converter class
├── duration-mapper.ts              — maps Songsterr [num, den] → alphaTab Duration
└── instrument-map.ts               — maps Songsterr instrumentId → MIDI program/channel
```

## Gotchas

- `score.finish(settings)` must be called before export — it finalizes internal state
- Drum tracks use `staff.isPercussion = true` and `note.string = -1` (must stay < 0 so alphaTab's `isStringed` returns false)
- `note.fret` is still set for drums (for internal use) but `percussionArticulation` drives the actual sound
- Some Songsterr bend types trigger an alphaTab warning ("Unsupported bend type") — this is cosmetic and the bend still exports correctly
