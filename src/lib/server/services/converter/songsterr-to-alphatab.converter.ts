import * as alphaTab from '@coderline/alphatab';
import type {
  ConversionWarning,
  SongsterrRevisionAutomationTempoPoint,
  SongsterrRevisionBeatPayload,
  SongsterrRevisionMeasurePayload,
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

    for (const entry of revisions) {
      this.buildTrack({
        score,
        entry,
        masterBarCount,
        warnings
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

      const markerText = this.getMarkerText(measure?.marker);
      if (markerText) {
        const section = new alphaTab.model.Section();
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
    warnings
  }: {
    score: alphaTab.model.Score;
    entry: SongsterrRevisionTrackInput;
    masterBarCount: number;
    warnings: ConversionWarning[];
  }): void {
    const { trackMeta, revision } = entry;
    const playbackMapping = mapSongsterrInstrumentToPlayback(
      revision.instrumentId ?? trackMeta.instrumentId
    );
    const trackStringCount =
      revision.tuning?.length ||
      trackMeta.tuning?.length ||
      revision.strings ||
      6;
    const maxVoicesInTrack = Math.max(
      1,
      ...revision.measures.map((measure) => measure.voices?.length || 0)
    );

    const track = new alphaTab.model.Track();
    track.name = trackMeta.title || trackMeta.name || revision.name || 'Track';
    track.shortName = track.name.slice(0, 20);
    track.playbackInfo.program = playbackMapping.program;
    const channels = this.getTrackChannels(
      score.tracks.length,
      staffIsPercussion(trackMeta, playbackMapping)
    );
    track.playbackInfo.primaryChannel = channels.primaryChannel;
    track.playbackInfo.secondaryChannel = channels.secondaryChannel;

    const staff = new alphaTab.model.Staff();
    const tuning = revision.tuning || trackMeta.tuning;
    if (Array.isArray(tuning) && tuning.length > 0) {
      staff.stringTuning = new alphaTab.model.Tuning('Custom', tuning, false);
    }
    staff.isPercussion = staffIsPercussion(trackMeta, playbackMapping);
    if (!staff.isPercussion) {
      staff.showTablature = true;
      staff.showStandardNotation = false;
    }

    for (let measureIndex = 0; measureIndex < masterBarCount; measureIndex++) {
      const bar = new alphaTab.model.Bar();
      const measure = revision.measures?.[measureIndex];
      if (staff.isPercussion) {
        bar.clef = alphaTab.model.Clef.Neutral;
      }

      for (let voiceIndex = 0; voiceIndex < maxVoicesInTrack; voiceIndex++) {
        const voice = new alphaTab.model.Voice();
        this.fillVoice({
          voice,
          sourceVoice: measure?.voices?.[voiceIndex],
          masterBar: score.masterBars[measureIndex],
          warnings,
          locationPrefix: `track:${trackMeta.partId}|measure:${measureIndex}|voice:${voiceIndex}`,
          trackStringCount,
          isPercussion: staff.isPercussion
        });

        bar.addVoice(voice);
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
    trackStringCount,
    isPercussion
  }: {
    voice: alphaTab.model.Voice;
    sourceVoice: SongsterrRevisionVoicePayload | undefined;
    masterBar: alphaTab.model.MasterBar;
    warnings: ConversionWarning[];
    locationPrefix: string;
    trackStringCount: number;
    isPercussion: boolean;
  }): void {
    const beats = sourceVoice?.beats || [];

    if (beats.length === 0) {
      this.fillWithRestBeats(voice, masterBar);
      return;
    }

    for (let beatIndex = 0; beatIndex < beats.length; beatIndex++) {
      const beatData = beats[beatIndex];
      const beat = this.mapBeat(
        beatData,
        warnings,
        `${locationPrefix}|beat:${beatIndex}`,
        trackStringCount,
        isPercussion
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
    trackStringCount: number,
    isPercussion: boolean
  ): alphaTab.model.Beat {
    const beat = new alphaTab.model.Beat();
    const mappedDuration = mapSongsterrDuration(beatData.duration);
    beat.duration = mappedDuration.duration;
    beat.dots = beatData.dots ?? mappedDuration.dots;
    beat.text = beatData.text || null;

    if (mappedDuration.isApproximate) {
      this.pushWarning(warnings, {
        code: 'duration_approximated',
        message: `Approximated unsupported duration ${JSON.stringify(
          beatData.duration
        )}`,
        location
      });
    }

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

    const notes = beatData.notes || [];
    for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
      const noteData = notes[noteIndex];
      if (noteData.rest) {
        continue;
      }
      const note = new alphaTab.model.Note();

      if (isPercussion) {
        if (typeof noteData.fret === 'number') {
          note.percussionArticulation = this.normalizePercussionArticulation(
            Math.round(noteData.fret)
          );
        } else {
          this.pushWarning(warnings, {
            code: 'drum_note_missing_fret',
            message: 'Drum note missing percussion articulation value',
            location: `${location}|note:${noteIndex}`
          });
        }
      } else {
        note.string = this.mapStringIndex(noteData.string, trackStringCount);
        note.fret = noteData.fret || 0;
      }

      if (noteData.tie) {
        note.isTieDestination = true;
      }

      if (typeof noteData.slide === 'string') {
        this.mapSlide(
          note,
          noteData.slide,
          warnings,
          `${location}|note:${noteIndex}`
        );
      }

      beat.addNote(note);
    }

    return beat;
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
    if (normalizedSlide === 'into_from_below') {
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
    if (normalizedSlide === 'out_down') {
      note.slideOutType = alphaTab.model.SlideOutType.OutDown;
      return;
    }

    this.pushWarning(warnings, {
      code: 'slide_unsupported',
      message: `Unsupported slide effect "${slide}"`,
      location
    });
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

  private getMarkerText(
    marker: SongsterrRevisionMeasurePayload['marker']
  ): string | null {
    if (!marker) {
      return null;
    }
    if (typeof marker === 'string') {
      return marker;
    }
    if (typeof marker.text === 'string' && marker.text.length > 0) {
      return marker.text;
    }
    return null;
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

      const ratioPosition =
        point.position > 0 ? Math.max(0, Math.min(1, point.position)) : 0;
      const tempoAutomation = new alphaTab.model.Automation();
      tempoAutomation.type = alphaTab.model.AutomationType.Tempo;
      tempoAutomation.isLinear = false;
      tempoAutomation.ratioPosition = ratioPosition;
      tempoAutomation.value = point.bpm;
      tempoAutomation.isVisible = true;
      masterBar.tempoAutomations.push(tempoAutomation);
    }
  }

  private mapStringIndex(
    songsterrString: number | undefined,
    stringCount: number
  ): number {
    if (
      typeof songsterrString !== 'number' ||
      !Number.isFinite(songsterrString)
    ) {
      return 1;
    }

    const rounded = Math.round(songsterrString);
    if (rounded < 1) {
      return 1;
    }
    if (rounded > stringCount) {
      return stringCount;
    }

    // Songsterr indexes strings top-to-bottom; alphaTab expects bottom-to-top.
    return stringCount - rounded + 1;
  }

  private pushWarning(
    warnings: ConversionWarning[],
    warning: ConversionWarning
  ): void {
    if (warnings.length < MAX_WARNINGS) {
      warnings.push(warning);
    }
  }

  private getTrackChannels(
    trackIndex: number,
    isPercussion: boolean
  ): { primaryChannel: number; secondaryChannel: number } {
    if (isPercussion) {
      return {
        primaryChannel: 9,
        secondaryChannel: 9
      };
    }

    const melodicChannels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
    const channel = melodicChannels[trackIndex % melodicChannels.length];
    return {
      primaryChannel: channel,
      secondaryChannel: channel
    };
  }

  private normalizePercussionArticulation(value: number): number {
    // Songsterr occasionally uses e-drum note ids which are outside the common GP/GM drum set.
    // Normalize those to stable GP-friendly drum sounds.
    if (value === 32) {
      return 38; // snare
    }
    if (value === 40) {
      return 38; // electric snare -> acoustic snare for better compatibility
    }
    if (value === 35) {
      return 36; // alternate kick
    }
    return value;
  }
}

function staffIsPercussion(
  trackMeta: SongsterrStateMetaCurrentTrack,
  playbackMapping: { isPercussion: boolean }
): boolean {
  return playbackMapping.isPercussion || !!trackMeta.isDrums;
}
