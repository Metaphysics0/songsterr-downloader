import Fetcher from '$lib/server/utils/fetcher.util';
import { convertArrayBufferToArray } from '$lib/utils/array';
import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';
import { SongsterrService } from './songsterr.service';
import type { SongsterrDownloadResponse } from '$lib/types';
import { logger } from '$lib/utils/logger';
import { SongsterrRevisionJsonService } from './songsterr-revision-json.service';
import { SongsterrToAlphaTabConverter } from './converter/songsterr-to-alphatab.converter';
import { GUITAR_PRO_CONTENT_TYPE } from '$lib/constants';

export class DownloadTabService {
  constructor(
    private readonly SupportedTabDownloadType: SupportedTabDownloadType
  ) {}

  async download(request: Request): Promise<SongsterrDownloadResponse> {
    if (this.SupportedTabDownloadType === 'bySearchResult') {
      return this.bySearchResult(request);
    }
    if (this.SupportedTabDownloadType === 'bySource') {
      return this.bySource(request);
    }
    if (this.SupportedTabDownloadType === 'byRevisionJson') {
      return this.byRevisionJson(request);
    }

    throw new Error(
      `Unsupported download type: ${this.SupportedTabDownloadType}`
    );
  }

  private async bySource(request: Request, options: BySourceOptions = {}) {
    const { source, songTitle, songId, artist } =
      options.requestParams || (await request.json());

    const { buffer, contentType } =
      await this.fetcher.fetchAndReturnArrayBuffer(source);

    const fileName = this.songsterrService.buildFileNameFromSongName(
      songTitle,
      source
    );

    return this.createDownloadResponse({ buffer, fileName, contentType });
  }

  private async bySearchResult(request: Request) {
    const { songId, songTitle, artist } = await request.json();

    const guitarProLink =
      await this.songsterrService.getGuitarProDownloadLinkFromSongId(songId);
    if (!guitarProLink) {
      throw new Error(`Unable to find download link from song: ${songTitle}`);
    }

    const { buffer, contentType } =
      await this.fetcher.fetchAndReturnArrayBuffer(guitarProLink);

    const fileName = this.songsterrService.buildFileNameFromSongName(
      songTitle,
      guitarProLink
    );

    return this.createDownloadResponse({ buffer, fileName, contentType });
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
      logger.warn('Songsterr to GP conversion warnings', {
        songId: stateMeta.songId,
        revisionId: stateMeta.revisionId,
        warningCount: allWarnings.length,
        warnings: allWarnings.slice(0, 20)
      });
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

  private readonly fetcher = new Fetcher();
  private readonly songsterrService = new SongsterrService();
  private readonly songsterrRevisionJsonService =
    new SongsterrRevisionJsonService();
  private readonly converter = new SongsterrToAlphaTabConverter();
}

interface BySourceOptions {
  requestParams?: {
    source: string;
    songTitle: string;
  };
}
