import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';
import { SongsterrService } from './songsterr.service';
import type {
  SongsterrDownloadFile,
  SongsterrStateMetaCurrent
} from '$lib/types';
import { logger } from '$lib/server/logger';
import { SongsterrRevisionJsonService } from './songsterr-revision-json.service';
import { SongsterrToAlphaTabConverter } from './converter/songsterr-to-alphatab.converter';

export class DownloadTabService {
  constructor(
    private readonly SupportedTabDownloadType: SupportedTabDownloadType
  ) {}

  async download(request: Request): Promise<SongsterrDownloadFile> {
    if (this.SupportedTabDownloadType === 'byRevisionJson') {
      return this.byRevisionJson(request);
    }
    if (this.SupportedTabDownloadType === 'byRevisionJsonMidi') {
      return this.byRevisionJsonMidi(request);
    }

    throw new Error(
      `Unsupported download type: ${this.SupportedTabDownloadType}`
    );
  }

  private async byRevisionJson(request: Request) {
    const { byLinkUrl, songTitle } = await request.json();
    if (!byLinkUrl) {
      throw new Error('Missing byLinkUrl');
    }

    const startedAt = performance.now();

    const stateMeta =
      await this.songsterrRevisionJsonService.getStateMetaFromTabUrl(byLinkUrl);
    const scrapedAt = performance.now();

    const { revisions, warnings: fetchWarnings } =
      await this.songsterrRevisionJsonService.fetchAllPartRevisionsWithFallback(stateMeta);
    const fetchedAt = performance.now();

    if (revisions.length === 0) {
      throw new Error(
        `[gp] Unable to fetch any revision payloads for songId ${stateMeta.songId}`
      );
    }

    const { data: gpData, warnings: convertWarnings } = this.converter.toGp7({
      meta: stateMeta,
      revisions
    });
    const convertedAt = performance.now();
    const allWarnings = [...fetchWarnings, ...convertWarnings];

    this.logTimings({
      format: 'gp',
      stateMeta,
      trackCount: revisions.length,
      byteLength: gpData.byteLength,
      startedAt,
      scrapedAt,
      fetchedAt,
      convertedAt
    });

    if (allWarnings.length > 0) {
      logger.warn(
        {
          songId: stateMeta.songId,
          revisionId: stateMeta.revisionId,
          warningCount: allWarnings.length,
          warnings: allWarnings.slice(0, 20)
        },
        'Songsterr to GP conversion warnings'
      );
    }

    const buffer = gpData.buffer.slice(
      gpData.byteOffset,
      gpData.byteOffset + gpData.byteLength
    ) as ArrayBuffer;

    const fileName = this.songsterrService.buildFileNameFromSongName(
      songTitle || stateMeta.title,
      `${stateMeta.songId}.gp`
    );

    return this.createDownloadResponse({
      buffer,
      fileName,
      contentType: 'application/gp'
    });
  }

  private async byRevisionJsonMidi(request: Request) {
    const { byLinkUrl, songTitle, separateTracks } = await request.json();
    if (!byLinkUrl) {
      throw new Error('Missing byLinkUrl');
    }

    const startedAt = performance.now();

    const stateMeta =
      await this.songsterrRevisionJsonService.getStateMetaFromTabUrl(byLinkUrl);
    const scrapedAt = performance.now();

    const { revisions, warnings: fetchWarnings } =
      await this.songsterrRevisionJsonService.fetchAllPartRevisionsWithFallback(stateMeta);
    const fetchedAt = performance.now();

    if (revisions.length === 0) {
      throw new Error(
        `[midi] Unable to fetch any revision payloads for songId ${stateMeta.songId}`
      );
    }

    const { data: midiData, warnings: convertWarnings } = this.converter.toMidi(
      {
        meta: stateMeta,
        revisions
      },
      {
        separateTracks: separateTracks === true
      }
    );
    const convertedAt = performance.now();
    const allWarnings = [...fetchWarnings, ...convertWarnings];

    this.logTimings({
      format: 'midi',
      stateMeta,
      trackCount: revisions.length,
      byteLength: midiData.byteLength,
      startedAt,
      scrapedAt,
      fetchedAt,
      convertedAt
    });

    if (allWarnings.length > 0) {
      logger.warn(
        {
          songId: stateMeta.songId,
          revisionId: stateMeta.revisionId,
          warningCount: allWarnings.length,
          warnings: allWarnings.slice(0, 20)
        },
        'Songsterr to MIDI conversion warnings'
      );
    }

    const buffer = midiData.buffer.slice(
      midiData.byteOffset,
      midiData.byteOffset + midiData.byteLength
    ) as ArrayBuffer;

    const fileName = this.songsterrService.buildFileNameFromSongName(
      songTitle || stateMeta.title,
      `${stateMeta.songId}.mid`
    );

    return this.createDownloadResponse({
      buffer,
      fileName,
      contentType: 'audio/midi'
    });
  }

  /*
   * A single structured line per download so a slow or timed-out invocation
   * can be attributed to a phase from the logs alone, rather than guessed at.
   */
  private logTimings({
    format,
    stateMeta,
    trackCount,
    byteLength,
    startedAt,
    scrapedAt,
    fetchedAt,
    convertedAt
  }: {
    format: 'gp' | 'midi';
    stateMeta: SongsterrStateMetaCurrent;
    trackCount: number;
    byteLength: number;
    startedAt: number;
    scrapedAt: number;
    fetchedAt: number;
    convertedAt: number;
  }) {
    logger.info(
      {
        format,
        songId: stateMeta.songId,
        revisionId: stateMeta.revisionId,
        trackCount,
        byteLength,
        scrapeMs: Math.round(scrapedAt - startedAt),
        fetchRevisionsMs: Math.round(fetchedAt - scrapedAt),
        convertMs: Math.round(convertedAt - fetchedAt),
        totalMs: Math.round(convertedAt - startedAt)
      },
      'Download timings'
    );
  }

  private createDownloadResponse({
    buffer,
    fileName,
    contentType = 'application/gp'
  }: {
    buffer: ArrayBuffer;
    fileName: string;
    contentType?: string;
  }): SongsterrDownloadFile {
    return {
      buffer,
      fileName,
      contentType
    };
  }

  private readonly songsterrService = new SongsterrService();
  private readonly songsterrRevisionJsonService =
    new SongsterrRevisionJsonService();
  private readonly converter = new SongsterrToAlphaTabConverter();
}
