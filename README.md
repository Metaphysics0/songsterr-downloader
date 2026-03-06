# Songsterr Downloader

A web app that converts Songsterr tabs to Guitar Pro (.gp7) files using alphaTab.

## How it works

1. User pastes a Songsterr URL
2. Server parses the page state to get song metadata and track info
3. Fetches per-track revision JSON payloads from Songsterr's CDN
4. Converts all tracks into an alphaTab score model
5. Exports as GP7 and triggers a client-side download

## Conversion features

- Multi-track support (guitar, bass, drums, keys, etc.)
- Time signatures, tempo changes, repeats, alternate endings, and section markers
- Note effects: bends, slides, harmonics, hammer-ons/pull-offs, vibrato, palm mute, ghost notes, staccato, accents, dead notes
- Tuplets (triplets, quintuplets, etc.)
- Multiple voices per measure
- Correct string tuning per track
- Percussion with proper MIDI articulation mapping (kick, snare, hi-hat, crashes, etc.)

## How to run

1. Clone the repo
2. Install [bun](https://bun.sh/)
3. `bun i && bun dev`

App runs at http://localhost:5173/

## Running tests

```
bun run test:unit
```
