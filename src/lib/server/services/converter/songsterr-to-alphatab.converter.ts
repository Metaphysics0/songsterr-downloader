import * as alphaTab from '@coderline/alphatab';
import type {
  ConversionWarning,
  SongsterrRevisionAutomationTempoPoint,
  SongsterrRevisionBeatPayload,
  SongsterrRevisionNotePayload,
  SongsterrRevisionTrackPayload,
  SongsterrRevisionVoicePayload,
  SongsterrStateMetaCurrent,
  SongsterrStateMetaCurrentTrack
} from '$lib/types';
import { mapSongsterrDuration } from './duration-mapper';
import { mapSongsterrInstrumentToPlayback } from './instrument-map';

export interface SongsterrRevisionTrackInput {
  trackMeta: SongsterrStateMetaCurrentTrack;
  revision: SongsterrRevisionTrackPayload;
}

interface SongsterrToGpInput {
  meta: SongsterrStateMetaCurrent;
  revisions: SongsterrRevisionTrackInput[];
}

interface SongsterrToGpOutput {
  data: Uint8Array;
  warnings: ConversionWarning[];
}

const MAX_WARNINGS = 200;

const velocityToDynamicMap: Record<string, alphaTab.model.DynamicValue> = {
  ppp: alphaTab.model.DynamicValue.PPP,
  pp: alphaTab.model.DynamicValue.PP,
  p: alphaTab.model.DynamicValue.P,
  mp: alphaTab.model.DynamicValue.MP,
  mf: alphaTab.model.DynamicValue.MF,
  f: alphaTab.model.DynamicValue.F,
  ff: alphaTab.model.DynamicValue.FF,
  fff: alphaTab.model.DynamicValue.FFF
};

const harmonicTypeMap: Record<string, alphaTab.model.HarmonicType> = {
  natural: alphaTab.model.HarmonicType.Natural,
  artificial: alphaTab.model.HarmonicType.Artificial,
  pinch: alphaTab.model.HarmonicType.Pinch,
  tap: alphaTab.model.HarmonicType.Tap,
  semi: alphaTab.model.HarmonicType.Semi,
  feedback: alphaTab.model.HarmonicType.Feedback
};

/**
 * Maps a Songsterr tuplet value to [numerator, denominator] for alphaTab.
 * E.g. triplet (3) = play 3 notes in the space of 2.
 */
function getTupletRatio(tuplet: number): [number, number] {
  switch (tuplet) {
    case 3:
      return [3, 2];
    case 5:
      return [5, 4];
    case 6:
      return [6, 4];
    case 7:
      return [7, 4];
    case 9:
      return [9, 8];
    case 10:
      return [10, 8];
    case 12:
      return [12, 8];
    default:
      // For uncommon tuplets, use n:(n-1) as a reasonable fallback
      if (tuplet > 1) {
        const denominator = Math.pow(2, Math.floor(Math.log2(tuplet)));
        return [tuplet, denominator];
      }
      return [1, 1];
  }
}

export class SongsterrToAlphaTabConverter {
  toGp7({ meta, revisions }: SongsterrToGpInput): SongsterrToGpOutput {
    const warnings: ConversionWarning[] = [];

    const score = new alphaTab.model.Score();
    score.title = meta.title;
    score.artist = meta.artist;
    score.tab = 'Songsterr Downloader';

    const masterTrack = this.pickMasterTrack(revisions);
    const masterBarCount = Math.max(1, this.getMasterBarCount(revisions));

    this.buildMasterBars({
      score,
      masterTrack,
      masterBarCount,
      warnings
    });

    let nextChannel = 0;
    for (const entry of revisions) {
      const instrumentId =
        entry.trackMeta.instrumentId ?? entry.revision.instrumentId;
      const isPercussion = instrumentId === 1024 || !!entry.trackMeta.isDrums;
      let channel: number;
      if (isPercussion) {
        channel = 9;
      } else {
        if (nextChannel === 9) nextChannel++; // skip drum channel
        channel = nextChannel;
        nextChannel++;
      }
      this.buildTrack({
        score,
        entry,
        masterBarCount,
        warnings,
        channel
      });
    }

    const settings = new alphaTab.Settings();
    score.finish(settings);

    const exporter = new alphaTab.exporter.Gp7Exporter();
    const data = exporter.export(score, settings);

    return { data, warnings };
  }

  private buildMasterBars({
    score,
    masterTrack,
    masterBarCount,
    warnings
  }: {
    score: alphaTab.model.Score;
    masterTrack: SongsterrRevisionTrackPayload | null;
    masterBarCount: number;
    warnings: ConversionWarning[];
  }): void {
    let timeSignatureNumerator = 4;
    let timeSignatureDenominator = 4;

    for (let index = 0; index < masterBarCount; index++) {
      const measure = masterTrack?.measures?.[index];
      const signature = this.getValidSignature(measure?.signature);
      if (signature) {
        [timeSignatureNumerator, timeSignatureDenominator] = signature;
      }

      const masterBar = new alphaTab.model.MasterBar();
      masterBar.timeSignatureNumerator = timeSignatureNumerator;
      masterBar.timeSignatureDenominator = timeSignatureDenominator;

      if (measure?.marker) {
        const section = new alphaTab.model.Section();
        const markerText = this.extractMarkerText(measure.marker);
        section.marker = markerText;
        section.text = markerText;
        masterBar.section = section;
      }

      if (measure?.repeatStart) {
        masterBar.isRepeatStart = true;
      }

      if (typeof measure?.repeatCount === 'number' && measure.repeatCount > 0) {
        masterBar.repeatCount = measure.repeatCount;
      }

      if (
        typeof measure?.alternateEnding === 'number' &&
        measure.alternateEnding > 0
      ) {
        masterBar.alternateEndings = measure.alternateEnding;
      }

      score.addMasterBar(masterBar);
    }

    const tempoPoints = this.findTempoPoints(masterTrack);
    this.applyTempoAutomations(score, tempoPoints, warnings);
  }

  private buildTrack({
    score,
    entry,
    masterBarCount,
    warnings,
    channel
  }: {
    score: alphaTab.model.Score;
    entry: SongsterrRevisionTrackInput;
    masterBarCount: number;
    warnings: ConversionWarning[];
    channel: number;
  }): void {
    const { trackMeta, revision } = entry;
    const playbackMapping = mapSongsterrInstrumentToPlayback(
      trackMeta.instrumentId ?? revision.instrumentId
    );

    const track = new alphaTab.model.Track();
    track.name = trackMeta.title || trackMeta.name || revision.name || 'Track';
    track.shortName = track.name.slice(0, 20);
    track.playbackInfo.program = playbackMapping.program;
    track.playbackInfo.primaryChannel = channel;
    track.playbackInfo.secondaryChannel = channel;

    const staff = new alphaTab.model.Staff();
    const tuning = revision.tuning || trackMeta.tuning;
    if (Array.isArray(tuning) && tuning.length > 0) {
      staff.stringTuning = new alphaTab.model.Tuning('Custom', tuning, false);
    }
    const isPercussion = playbackMapping.isPercussion || !!trackMeta.isDrums;
    staff.isPercussion = isPercussion;
    const numStrings = Array.isArray(tuning) ? tuning.length : 6;

    for (let measureIndex = 0; measureIndex < masterBarCount; measureIndex++) {
      const bar = new alphaTab.model.Bar();
      const measure = revision.measures?.[measureIndex];
      const voiceCount = measure?.voices?.length || 0;

      if (voiceCount === 0) {
        // No voices at all — fill with a single rest voice
        const voice = new alphaTab.model.Voice();
        this.fillWithRestBeats(voice, score.masterBars[measureIndex]);
        bar.addVoice(voice);
      } else {
        // Process all voices (not just the first one)
        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
          const voice = new alphaTab.model.Voice();
          const sourceVoice = measure!.voices![voiceIndex];

          this.fillVoice({
            voice,
            sourceVoice,
            masterBar: score.masterBars[measureIndex],
            warnings,
            locationPrefix: `track:${trackMeta.partId}|measure:${measureIndex}|voice:${voiceIndex}`,
            isPercussion,
            numStrings
          });

          bar.addVoice(voice);
        }
      }

      staff.addBar(bar);
    }

    track.addStaff(staff);
    score.addTrack(track);
  }

  private fillVoice({
    voice,
    sourceVoice,
    masterBar,
    warnings,
    locationPrefix,
    isPercussion,
    numStrings
  }: {
    voice: alphaTab.model.Voice;
    sourceVoice: SongsterrRevisionVoicePayload | undefined;
    masterBar: alphaTab.model.MasterBar;
    warnings: ConversionWarning[];
    locationPrefix: string;
    isPercussion: boolean;
    numStrings: number;
  }): void {
    const beats = sourceVoice?.beats || [];

    if (beats.length === 0 || sourceVoice?.rest) {
      this.fillWithRestBeats(voice, masterBar);
      return;
    }

    for (let beatIndex = 0; beatIndex < beats.length; beatIndex++) {
      const beatData = beats[beatIndex];
      const beat = this.mapBeat(
        beatData,
        warnings,
        `${locationPrefix}|beat:${beatIndex}`,
        isPercussion,
        numStrings
      );
      voice.addBeat(beat);
    }

    if (voice.beats.length === 0) {
      this.fillWithRestBeats(voice, masterBar);
    }
  }

  private mapBeat(
    beatData: SongsterrRevisionBeatPayload,
    warnings: ConversionWarning[],
    location: string,
    isPercussion: boolean,
    numStrings: number
  ): alphaTab.model.Beat {
    const beat = new alphaTab.model.Beat();

    // Handle rest beats
    if (beatData.rest) {
      beat.isEmpty = true;
    }

    // Duration mapping
    const mappedDuration = mapSongsterrDuration(beatData.duration);
    beat.duration = mappedDuration.duration;
    beat.dots = beatData.dots ?? mappedDuration.dots;
    beat.text = beatData.text || null;

    if (mappedDuration.isApproximate && !beatData.tuplet) {
      this.pushWarning(warnings, {
        code: 'duration_approximated',
        message: `Approximated unsupported duration ${JSON.stringify(
          beatData.duration
        )}`,
        location
      });
    }

    // Tuplet support
    if (typeof beatData.tuplet === 'number' && beatData.tuplet > 1) {
      const [num, den] = getTupletRatio(beatData.tuplet);
      beat.tupletNumerator = num;
      beat.tupletDenominator = den;

      // For tuplets, use the base duration from `type` field rather than the
      // fractional `duration` field, since tuplets modify the base duration.
      if (typeof beatData.type === 'number' && beatData.type > 0) {
        const baseDuration = mapSongsterrDuration([1, beatData.type]);
        beat.duration = baseDuration.duration;
        beat.dots = beatData.dots ?? 0;
      }
    }

    // Dynamics / velocity
    if (typeof beatData.velocity === 'string') {
      const mappedDynamic =
        velocityToDynamicMap[beatData.velocity.toLowerCase()];
      if (typeof mappedDynamic === 'number') {
        beat.dynamics = mappedDynamic;
      } else {
        this.pushWarning(warnings, {
          code: 'velocity_unknown',
          message: `Unsupported beat velocity "${beatData.velocity}"`,
          location
        });
      }
    }

    // Pick stroke
    if (typeof beatData.pickStroke === 'string') {
      const ps = beatData.pickStroke.toLowerCase();
      if (ps === 'down') {
        beat.pickStroke = alphaTab.model.PickStroke.Down;
      } else if (ps === 'up') {
        beat.pickStroke = alphaTab.model.PickStroke.Up;
      }
    }

    // Beat-level vibrato
    if (beatData.wideVibrato || beatData.vibratoWithTremoloBar) {
      beat.vibrato = alphaTab.model.VibratoType.Wide;
    } else if (beatData.vibrato) {
      beat.vibrato = alphaTab.model.VibratoType.Slight;
    }

    // Map notes
    const notes = beatData.notes || [];
    for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
      const noteData = notes[noteIndex];
      if (noteData.rest) {
        continue;
      }
      const note = this.mapNote(
        noteData,
        beatData,
        warnings,
        `${location}|note:${noteIndex}`,
        isPercussion,
        numStrings
      );
      beat.addNote(note);
    }

    return beat;
  }

  private mapNote(
    noteData: SongsterrRevisionNotePayload,
    beatData: SongsterrRevisionBeatPayload,
    warnings: ConversionWarning[],
    location: string,
    isPercussion: boolean,
    numStrings: number
  ): alphaTab.model.Note {
    const note = new alphaTab.model.Note();

    // Songsterr: string 0 = highest pitch, alphaTab: string 1 = lowest pitch
    note.string = isPercussion ? 0 : numStrings - (noteData.string ?? 0);
    note.fret = noteData.fret ?? 0;

    if (isPercussion) {
      note.percussionArticulation = noteData.fret ?? 0;
    }

    // Tie
    if (noteData.tie) {
      note.isTieDestination = true;
    }

    // Dead note
    if (noteData.dead) {
      note.isDead = true;
    }

    // Ghost note
    if (noteData.ghost) {
      note.isGhost = true;
    }

    // Hammer-on / pull-off
    if (noteData.hp) {
      note.isHammerPullOrigin = true;
    }

    // Staccato
    if (noteData.staccato) {
      note.isStaccato = true;
    }

    // Accentuated
    if (noteData.accentuated) {
      note.accentuated = alphaTab.model.AccentuationType.Normal;
    }

    // Palm mute (beat-level property propagated to each note)
    if (beatData.palmMute) {
      note.isPalmMute = true;
    }

    // Vibrato (note-level takes priority, falls back to beat-level)
    if (noteData.wideVibrato) {
      note.vibrato = alphaTab.model.VibratoType.Wide;
    } else if (noteData.vibrato) {
      note.vibrato = alphaTab.model.VibratoType.Slight;
    }

    // Slide
    if (typeof noteData.slide === 'string') {
      this.mapSlide(note, noteData.slide, warnings, location);
    }

    // Harmonics
    if (typeof noteData.harmonic === 'string') {
      this.mapHarmonic(note, noteData, warnings, location);
    }

    // Bend
    if (noteData.bend && noteData.bend.points && noteData.bend.points.length > 0) {
      this.mapBend(note, noteData.bend);
    }

    return note;
  }

  private mapSlide(
    note: alphaTab.model.Note,
    slide: string,
    warnings: ConversionWarning[],
    location: string
  ): void {
    const normalizedSlide = slide.toLowerCase();
    if (normalizedSlide === 'shift') {
      note.slideOutType = alphaTab.model.SlideOutType.Shift;
      return;
    }
    if (normalizedSlide === 'legato') {
      note.slideOutType = alphaTab.model.SlideOutType.Legato;
      return;
    }
    if (normalizedSlide === 'into_from_below' || normalizedSlide === 'below') {
      note.slideInType = alphaTab.model.SlideInType.IntoFromBelow;
      return;
    }
    if (normalizedSlide === 'into_from_above') {
      note.slideInType = alphaTab.model.SlideInType.IntoFromAbove;
      return;
    }
    if (normalizedSlide === 'out_up') {
      note.slideOutType = alphaTab.model.SlideOutType.OutUp;
      return;
    }
    if (normalizedSlide === 'out_down' || normalizedSlide === 'downwards') {
      note.slideOutType = alphaTab.model.SlideOutType.OutDown;
      return;
    }

    this.pushWarning(warnings, {
      code: 'slide_unsupported',
      message: `Unsupported slide effect "${slide}"`,
      location
    });
  }

  private mapHarmonic(
    note: alphaTab.model.Note,
    noteData: SongsterrRevisionNotePayload,
    warnings: ConversionWarning[],
    location: string
  ): void {
    const harmonicStr = noteData.harmonic!.toLowerCase();
    const mappedType = harmonicTypeMap[harmonicStr];

    if (typeof mappedType === 'number') {
      note.harmonicType = mappedType;
      if (typeof noteData.harmonicFret === 'number') {
        note.harmonicValue = noteData.harmonicFret;
      }
    } else {
      this.pushWarning(warnings, {
        code: 'harmonic_unsupported',
        message: `Unsupported harmonic type "${noteData.harmonic}"`,
        location
      });
    }
  }

  private mapBend(
    note: alphaTab.model.Note,
    bend: { tone: number; points: { position: number; tone: number }[] }
  ): void {
    note.bendType = alphaTab.model.BendType.Custom;

    for (const point of bend.points) {
      // Songsterr uses position 0-60, alphaTab uses offset 0-60 (same scale)
      // Songsterr tone is in semitones × 100 (100 = 1 semitone)
      // alphaTab value is in quarter-tones (100 = 1 quarter tone)
      // So: 1 semitone = 2 quarter tones → multiply by 2
      const offset = Math.round(point.position);
      const value = Math.round(point.tone * 2);
      note.addBendPoint(new alphaTab.model.BendPoint(offset, value));
    }
  }

  private fillWithRestBeats(
    voice: alphaTab.model.Voice,
    masterBar: alphaTab.model.MasterBar
  ): void {
    const denominator = masterBar.timeSignatureDenominator || 4;
    const numerator = masterBar.timeSignatureNumerator || 4;

    const mappedDuration = mapSongsterrDuration([1, denominator]);
    for (let i = 0; i < numerator; i++) {
      const restBeat = new alphaTab.model.Beat();
      restBeat.isEmpty = true;
      restBeat.duration = mappedDuration.duration;
      restBeat.dots = mappedDuration.dots;
      voice.addBeat(restBeat);
    }
  }

  private getMasterBarCount(revisions: SongsterrRevisionTrackInput[]): number {
    return revisions.reduce((max, entry) => {
      return Math.max(max, entry.revision?.measures?.length || 0);
    }, 0);
  }

  private pickMasterTrack(
    revisions: SongsterrRevisionTrackInput[]
  ): SongsterrRevisionTrackPayload | null {
    if (revisions.length === 0) {
      return null;
    }

    return revisions.reduce((longest, current) => {
      const currentLength = current.revision?.measures?.length || 0;
      const longestLength = longest.revision?.measures?.length || 0;
      return currentLength > longestLength ? current : longest;
    }).revision;
  }

  private getValidSignature(
    signature: [number, number] | undefined
  ): [number, number] | null {
    if (!Array.isArray(signature) || signature.length !== 2) {
      return null;
    }
    const [numerator, denominator] = signature;
    if (!numerator || !denominator) {
      return null;
    }
    return [numerator, denominator];
  }

  private extractMarkerText(marker: string | { text: string; width?: number }): string {
    if (typeof marker === 'string') {
      return marker;
    }
    if (marker && typeof marker === 'object' && typeof marker.text === 'string') {
      return marker.text;
    }
    return '';
  }

  private findTempoPoints(
    masterTrack: SongsterrRevisionTrackPayload | null
  ): SongsterrRevisionAutomationTempoPoint[] {
    const tempo = masterTrack?.automations?.tempo;
    return Array.isArray(tempo) ? tempo : [];
  }

  private applyTempoAutomations(
    score: alphaTab.model.Score,
    points: SongsterrRevisionAutomationTempoPoint[],
    warnings: ConversionWarning[]
  ): void {
    for (const point of points) {
      const barIndex = point.measure;
      const masterBar = score.masterBars[barIndex];
      if (!masterBar) {
        this.pushWarning(warnings, {
          code: 'tempo_measure_out_of_range',
          message: `Tempo automation references missing measure ${barIndex}`,
          location: `measure:${barIndex}`
        });
        continue;
      }

      // alphaTab reference index: 0=whole, 1=half(×0.5), 2=quarter(×1.0), 3=dotted-quarter(×1.5), 4=half(×2.0), 5=dotted-half(×3.0)
      // Songsterr BPM is always in quarter-note beats, so use reference=2 (×1.0)
      const tempoReference = 2;
      const ratioPosition =
        point.position > 0
          ? Math.max(0, Math.min(1, point.position / (point.type || 4)))
          : 0;
      const tempoAutomation = alphaTab.model.Automation.buildTempoAutomation(
        false,
        ratioPosition,
        point.bpm,
        tempoReference,
        true
      );
      masterBar.tempoAutomations.push(tempoAutomation);
    }
  }

  private pushWarning(
    warnings: ConversionWarning[],
    warning: ConversionWarning
  ): void {
    if (warnings.length < MAX_WARNINGS) {
      warnings.push(warning);
    }
  }
}
