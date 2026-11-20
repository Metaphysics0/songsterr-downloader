#!/usr/bin/env python3
"""
Regenerates src/lib/converter/rse-presets.json from a local Guitar Pro 8 install.

Guitar Pro ships one preset .gp file per General MIDI program (plus a drum kit)
inside its executable, as Qt resources (`004.Midi/...`). Each preset is a
single-track score whose <Sound> names the RSE sound Guitar Pro uses for that
program: sound path, soundbank patch and effect chain. Songsterr's own .gp
downloads use exactly these sounds.

The presets are ordinary zip archives embedded in the binary, so this script
finds each one by its end-of-central-directory record, reads Content/score.gpif
and keeps the single-track files whose AudioEngineState is MIDI (the GM
presets; the other embedded files are templates and artist presets).

Usage:
  python3 -I scripts/extract-gp-rse-presets.py \
    "/Applications/Guitar Pro 8.app/Contents/MacOS/GuitarPro" \
    src/lib/converter/rse-presets.json
  bun run format
"""

import io
import json
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zipfile


def embedded_scores(binary: bytes):
    for match in re.finditer(rb'PK\x05\x06', binary):
        end = match.start()
        cd_size, cd_offset = struct.unpack('<II', binary[end + 12:end + 20])
        start = end - cd_size - cd_offset
        if start < 0:
            continue
        comment_length = struct.unpack('<H', binary[end + 20:end + 22])[0]
        try:
            archive = zipfile.ZipFile(
                io.BytesIO(binary[start:end + 22 + comment_length]))
            yield ET.fromstring(archive.read('Content/score.gpif'))
        except Exception:
            continue


def gm_preset(score):
    tracks = score.find('Tracks')
    if tracks is None or len(tracks) != 1:
        return None
    track = tracks[0]
    if track.findtext('AudioEngineState') != 'MIDI':
        return None
    sound = track.find('Sounds/Sound')
    if sound is None or sound.find('RSE') is None:
        return None
    is_drums = track.findtext('InstrumentSet/Type') == 'drumKit'
    key = 'drums' if is_drums else sound.findtext('MIDI/Program')
    return key, {
        'path': sound.findtext('Path'),
        'patch': sound.findtext('RSE/SoundbankPatch'),
        'pickup': int(sound.findtext('RSE/Pickups/OverloudPosition') or 0),
        'effects': [
            {'id': effect.get('id'), 'params': effect.findtext('Parameters')}
            for effect in sound.findall('RSE/EffectChain/Effect')
            if effect.get('id')
        ],
    }


def main():
    binary_path, out_path = sys.argv[1], sys.argv[2]
    with open(binary_path, 'rb') as f:
        binary = f.read()
    presets = {}
    for score in embedded_scores(binary):
        preset = gm_preset(score)
        if preset:
            presets[preset[0]] = preset[1]

    keys = sorted((k for k in presets if k != 'drums'), key=int) + ['drums']
    lines = [
        f'  {json.dumps(k)}: {json.dumps(presets[k], separators=(",", ": "))}'
        for k in keys if k in presets
    ]
    with open(out_path, 'w') as f:
        f.write('{\n' + ',\n'.join(lines) + '\n}\n')
    missing = [p for p in range(128) if str(p) not in presets]
    print(f'wrote {len(lines)} presets to {out_path}; no preset for {missing}')


if __name__ == '__main__':
    main()
