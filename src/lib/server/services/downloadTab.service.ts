import Fetcher from '$lib/utils/fetch';
import {
  buildFileNameFromSongName,
  getDownloadLinksFromRevisions,
  getSearchResultFromSongsterrUrl
} from './songsterr.service';
import { convertArrayBufferToArray } from '$lib/utils/array';
import type { DownloadTabType } from '$lib/types/downloadType';
import { logger } from '$lib/utils/logger';

export class DownloadTabService {
  private readonly fetcher = new Fetcher();
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

    const fileName = buildFileNameFromSongName(songTitle, source);
    return this.createDownloadResponse({ buffer, fileName, contentType });
  }

  private async bySearchResult(request: Request) {
    const { songId, songTitle, byLinkUrl } = await request.json();
    if (byLinkUrl) {
      logger.log(
        `downloadTabService - bySearchResult - Getting tab from url: ${byLinkUrl}`
      );
      const { source } = await getSearchResultFromSongsterrUrl(byLinkUrl);
      if (source) {
        return this.bySource({} as Request, {
          requestParams: { songTitle, source }
        });
      }
    }

    // const link = await getDownloadLinkFromSongId(songId);
    const link = await getDownloadLinksFromRevisions(songId);
    if (!link) {
      throw new Error(`Unable to find download link from song: ${songTitle}`);
    }

    const { buffer, contentType } =
      await this.fetcher.fetchAndReturnArrayBuffer(link);

    const fileName = buildFileNameFromSongName(songTitle, link);
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
