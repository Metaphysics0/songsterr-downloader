import Fetcher from '$lib/server/utils/fetcher.util';
import { convertArrayBufferToArray } from '$lib/utils/array';
import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';
import { SongsterrService } from './songsterr.service';
import type { SongsterrDownloadResponse } from '$lib/types';
import { s3 } from '$lib/server/utils/s3.util';
import { logger } from '$lib/utils/logger';

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

    throw new Error(
      `Unsupported download type: ${this.SupportedTabDownloadType}`
    );
  }

  private async bySource(request: Request, options: BySourceOptions = {}) {
    const { source, songTitle, songId, artist } =
      options.requestParams || (await request.json());

    // Check S3 cache first
    if (songId) {
      const cached = await s3.get(songId);
      if (cached) {
        logger.info(`Serving tab ${songId} from S3 cache`);
        const fileName = this.songsterrService.buildFileNameFromSongName(
          songTitle,
          source
        );
        return this.createDownloadResponse({
          buffer: cached.buffer,
          fileName,
          contentType: 'application/gp'
        });
      }
    }

    const { buffer, contentType } =
      await this.fetcher.fetchAndReturnArrayBuffer(source);

    const fileName = this.songsterrService.buildFileNameFromSongName(
      songTitle,
      source
    );

    // Store to S3 in background (don't block response)
    if (songId) {
      s3.put(songId, buffer, { artist: artist || '', title: songTitle || '' }).catch((err) =>
        logger.error('Failed to store tab to S3', err)
      );
    }

    return this.createDownloadResponse({ buffer, fileName, contentType });
  }

  private async bySearchResult(request: Request) {
    const { songId, songTitle, artist } = await request.json();

    // Check S3 cache first
    const cached = await s3.get(songId);
    if (cached) {
      logger.info(`Serving tab ${songId} from S3 cache`);
      const fileName = this.songsterrService.buildFileNameFromSongName(
        songTitle,
        `${songId}.gp`
      );
      return this.createDownloadResponse({
        buffer: cached.buffer,
        fileName,
        contentType: 'application/gp'
      });
    }

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

    // Store to S3 in background (don't block response)
    s3.put(songId, buffer, { artist: artist || '', title: songTitle || '' }).catch((err) =>
      logger.error('Failed to store tab to S3', err)
    );

    return this.createDownloadResponse({ buffer, fileName, contentType });
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
}

interface BySourceOptions {
  requestParams?: {
    source: string;
    songTitle: string;
  };
}
