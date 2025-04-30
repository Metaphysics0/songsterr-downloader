import Fetcher from '$lib/server/utils/fetcher.util';
import { convertArrayBufferToArray } from '$lib/utils/array';
import type { DownloadTabType } from '$lib/types/downloadType';
import { SongsterrService } from './songsterr.service';

export class DownloadTabService {
  constructor(private readonly downloadTabType: DownloadTabType) {}

  async download(request: Request): Promise<DownloadResponse> {
    if (this.downloadTabType === 'bySearchResult') {
      return this.bySearchResult(request);
    }
    if (this.downloadTabType === 'bySource') {
      return this.bySource(request);
    }

    throw new Error(`Unsupported download type: ${this.downloadTabType}`);
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
  }): DownloadResponse {
    return {
      file: convertArrayBufferToArray(buffer),
      fileName,
      contentType
    };
  }

  private readonly fetcher = new Fetcher();
  private readonly songsterrService = new SongsterrService();
}

interface DownloadResponse {
  file: number[];
  fileName: string;
  contentType: string;
}

interface BySourceOptions {
  requestParams?: {
    source: string;
    songTitle: string;
  };
}
