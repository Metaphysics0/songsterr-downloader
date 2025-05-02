import Fetcher from '$lib/server/utils/fetcher.util';
import { convertArrayBufferToArray } from '$lib/utils/array';
import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';
import { SongsterrService } from './songsterr.service';
import { SongsterrDownloadResponse } from '$lib/types';

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
    const { source, songTitle } =
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
    const { songId, songTitle } = await request.json();

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
