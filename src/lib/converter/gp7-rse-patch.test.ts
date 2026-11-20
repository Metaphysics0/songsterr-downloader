import { describe, expect, it } from 'vitest';
import { unzipSync } from 'fflate';
import { patchRseSoundsInGpif } from './gp7-rse-patch';
import { SongsterrToAlphaTabConverter } from './songsterr-to-alphatab.converter';
import type {
  SongsterrRevisionTrackPayload,
  SongsterrStateMetaCurrentTrack
} from '$lib/types';

const DISTORTION_PATH = 'Stringed/Electric Guitars/Distortion Guitar';

/** A track as alphaTab's Gp7Exporter writes it (only the parts the patch reads). */
function track(
  id: number,
  programs: number[],
  instrumentSetType = 'electricGuitar'
): string {
  const sounds = programs
    .map(
      (program, i) =>
        `<Sound><Name><![CDATA[S${i}]]></Name><Label><![CDATA[S${i}]]></Label>` +
        `<Path><![CDATA[Midi/${program}]]></Path><Role><![CDATA[Factory]]></Role>` +
        `<MIDI><LSB>0</LSB><MSB>0</MSB><Program>${program}</Program></MIDI></Sound>`
    )
    .join('');
  const automations = programs
    .map(
      (program, i) =>
        `<Automation><Type>Sound</Type><Bar>${i}</Bar>` +
        `<Value><![CDATA[Midi/${program};S${i};Factory]]></Value></Automation>`
    )
    .join('');
  return (
    `<Track id="${id}"><InstrumentSet><Type>${instrumentSetType}</Type></InstrumentSet>` +
    '<AudioEngineState>MIDI</AudioEngineState>' +
    `<Sounds>${sounds}</Sounds><Automations>${automations}</Automations></Track>`
  );
}

function gpif(...tracks: string[]): string {
  return `<GPIF><Tracks>${tracks.join('')}</Tracks></GPIF>`;
}

describe('patchRseSoundsInGpif', () => {
  it('switches a track to the RSE sound Guitar Pro uses for its program', () => {
    const patched = patchRseSoundsInGpif(gpif(track(0, [30])));

    expect(patched).toContain('<AudioEngineState>RSE</AudioEngineState>');
    expect(patched).toContain(`<Path><![CDATA[${DISTORTION_PATH}]]></Path>`);
    expect(patched).toContain(
      `<Value><![CDATA[${DISTORTION_PATH};S0;Factory]]></Value>`
    );
    expect(patched).toContain(
      '<SoundbankPatch>Classic-Guitar</SoundbankPatch>'
    );
    expect(patched).toContain(
      '<Effect id="A06_StackBritishStack"><Parameters>1 0.91 0.67 0.32 0.69 0.51 0.95 0</Parameters></Effect>'
    );
    // The MIDI program stays, as in Guitar Pro's own presets.
    expect(patched).toContain('<Program>30</Program>');
    expect(patched).not.toContain('Midi/');
  });

  it('uses the drum kit preset for drum tracks', () => {
    const patched = patchRseSoundsInGpif(gpif(track(0, [0], 'drumKit')));

    expect(patched).toContain('<Path><![CDATA[Drums/Drums/Drumkit]]></Path>');
    expect(patched).toContain(
      '<SoundbankPatch>Drumkit-Master</SoundbankPatch>'
    );
    expect(patched).not.toContain('Orchestra/Keyboard/Acoustic Piano');
  });

  it('patches every sound of a track with program changes', () => {
    const patched = patchRseSoundsInGpif(gpif(track(0, [27, 30])));

    expect(patched).toContain(
      '<Value><![CDATA[Stringed/Electric Guitars/Clean Guitar;S0;Factory]]></Value>'
    );
    expect(patched).toContain(
      `<Value><![CDATA[${DISTORTION_PATH};S1;Factory]]></Value>`
    );
    expect(patched.match(/<SoundbankPatch>/g)).toHaveLength(2);
  });

  it('leaves a track on MIDI when one of its programs has no preset', () => {
    // GM 61 (Brass Section) has no Guitar Pro preset.
    const unpatched = track(1, [30, 61]);
    const patched = patchRseSoundsInGpif(gpif(track(0, [30]), unpatched));

    expect(patched).toContain(unpatched);
    expect(patched.match(/<AudioEngineState>RSE/g)).toHaveLength(1);
  });

  it('every preset declares a sound path, patch and effect chain', async () => {
    const presets: Record<string, { path: string; patch: string }> = (
      await import('./rse-presets.json')
    ).default;
    const programs = Object.keys(presets).filter((key) => key !== 'drums');

    expect(presets.drums).toBeDefined();
    expect(programs).toHaveLength(127);
    for (const preset of Object.values(presets)) {
      expect(preset.path).toMatch(/^(Stringed|Orchestra|Drums)\//);
      expect(preset.patch).toBeTruthy();
    }
  });
});

describe('SongsterrToAlphaTabConverter.toGp7 RSE sounds', () => {
  it('exports guitar and drum tracks with RSE sounds', () => {
    const quarterNote = (fret: number) => ({
      notes: [{ fret, string: 0 }],
      duration: [1, 4] as [number, number],
      type: 4
    });
    const revision = (instrumentId: number): SongsterrRevisionTrackPayload => ({
      instrumentId,
      measures: [{ voices: [{ beats: [quarterNote(36)] }], signature: [1, 4] }]
    });
    const guitar: SongsterrStateMetaCurrentTrack = {
      partId: 0,
      instrumentId: 30,
      title: 'Guitar',
      tuning: [64, 59, 55, 50, 45, 40]
    };
    const drums: SongsterrStateMetaCurrentTrack = {
      partId: 1,
      instrumentId: 1024,
      isDrums: true,
      title: 'Drums',
      tuning: []
    };

    const { data } = new SongsterrToAlphaTabConverter().toGp7({
      meta: {
        songId: 1,
        revisionId: 1,
        image: 'test',
        title: 'Test Song',
        artist: 'Test Artist',
        tracks: [guitar, drums]
      },
      revisions: [
        { trackMeta: guitar, revision: revision(30) },
        { trackMeta: drums, revision: revision(1024) }
      ]
    });
    const exported = new TextDecoder().decode(
      unzipSync(data)['Content/score.gpif']
    );

    expect(exported.match(/<AudioEngineState>RSE/g)).toHaveLength(2);
    expect(exported).not.toContain('<AudioEngineState>MIDI');
    expect(exported).toContain(`<![CDATA[${DISTORTION_PATH}]]>`);
    expect(exported).toContain('<![CDATA[Drums/Drums/Drumkit]]>');
  });
});
