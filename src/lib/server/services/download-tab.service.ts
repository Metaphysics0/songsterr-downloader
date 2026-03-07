import { convertArrayBufferToArray } from '$lib/utils/array';
import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';
import { SongsterrService } from './songsterr.service';
import type { SongsterrDownloadResponse } from '$lib/types';
import { logger } from '$lib/server/logger';
import { SongsterrRevisionJsonService } from './songsterr-revision-json.service';
import { SongsterrToAlphaTabConverter } from './converter/songsterr-to-alphatab.converter';
import { GUITAR_PRO_CONTENT_TYPE, MIDI_CONTENT_TYPE } from '$lib/constants';

export class DownloadTabService {
  constructor(
    private readonly SupportedTabDownloadType: SupportedTabDownloadType
  ) {}

  async download(request: Request): Promise<SongsterrDownloadResponse> {
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

    const stateMeta =
      await this.songsterrRevisionJsonService.getStateMetaFromTabUrl(byLinkUrl);

    const { revisions, warnings: fetchWarnings } =
      await this.songsterrRevisionJsonService.fetchAllPartRevisions(stateMeta);

    if (revisions.length === 0) {
      throw new Error(
        `Unable to fetch any revision payloads for songId ${stateMeta.songId}`
      );
    }

    const { data: gpData, warnings: convertWarnings } = this.converter.toGp7({
      meta: stateMeta,
      revisions
    });
    const allWarnings = [...fetchWarnings, ...convertWarnings];

    if (allWarnings.length > 0) {
      logger.warn({
        songId: stateMeta.songId,
        revisionId: stateMeta.revisionId,
        warningCount: allWarnings.length,
        warnings: allWarnings.slice(0, 20)
      }, 'Songsterr to GP conversion warnings');
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
      contentType: GUITAR_PRO_CONTENT_TYPE
    });
  }

  private async byRevisionJsonMidi(request: Request) {
    const { byLinkUrl, songTitle } = await request.json();
    if (!byLinkUrl) {
      throw new Error('Missing byLinkUrl');
    }

    const stateMeta =
      await this.songsterrRevisionJsonService.getStateMetaFromTabUrl(byLinkUrl);

    const { revisions, warnings: fetchWarnings } =
      await this.songsterrRevisionJsonService.fetchAllPartRevisions(stateMeta);

    if (revisions.length === 0) {
      throw new Error(
        `Unable to fetch any revision payloads for songId ${stateMeta.songId}`
      );
    }

    const { data: midiData, warnings: convertWarnings } = this.converter.toMidi(
      {
        meta: stateMeta,
        revisions
      }
    );
    const allWarnings = [...fetchWarnings, ...convertWarnings];

    if (allWarnings.length > 0) {
      logger.warn({
        songId: stateMeta.songId,
        revisionId: stateMeta.revisionId,
        warningCount: allWarnings.length,
        warnings: allWarnings.slice(0, 20)
      }, 'Songsterr to MIDI conversion warnings');
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
      contentType: MIDI_CONTENT_TYPE
    });
  }

  private createDownloadResponse({
    buffer,
    fileName,
    contentType = 'application/gp'
  }: {
    buffer: ArrayBuffer;
    fileName: string;
    contentType?: string;
  }): SongsterrDownloadResponse {
    return {
      file: convertArrayBufferToArray(buffer),
      fileName,
      contentType
    };
  }

  private readonly songsterrService = new SongsterrService();
  private readonly songsterrRevisionJsonService =
    new SongsterrRevisionJsonService();
  private readonly converter = new SongsterrToAlphaTabConverter();
}
