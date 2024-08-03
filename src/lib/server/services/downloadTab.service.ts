import Fetcher from '$lib/utils/fetch';
import {
  buildFileNameFromSongName,
  getDownloadLinkFromSongId,
  getSearchResultFromSongsterrUrl
} from './songsterr.service';
import { convertArrayBufferToArray } from '$lib/utils/array';
import { normalize } from '$lib/utils/string';
import { ParamsHelper } from '../utils/params';
import { logger } from '$lib/utils/logger';
import { DownloadTabType } from '$lib/types/downloadType';
import { BulkDownloadService } from './bulk-download/service';

export class DownloadTabService {
  private readonly fetcher = new Fetcher();
  private readonly paramsHelper = new ParamsHelper();
  constructor(private readonly downloadTabType: DownloadTabType) {}

  async download(request: Request): Promise<DownloadResponse> {
    switch (this.downloadTabType) {
      case DownloadTabType.BY_SEARCH_RESULT:
        return this.bySearchResult(request);
      case DownloadTabType.BY_SOURCE:
        return this.bySource(request);
      case DownloadTabType.BULK:
        return this.bulk(request);
      default:
        throw new Error(`Unsupported download type: ${this.downloadTabType}`);
    }
  }

  private async bySource(request: Request, options: BySourceOptions = {}) {
    const { source, songTitle, songId } =
      options.requestParams || (await request.json());
    const { buffer, contentType } =
      await this.fetcher.fetchAndReturnArrayBuffer(source);

    const fileName = buildFileNameFromSongName(songTitle, source);
    return this.createDownloadResponse({
      buffer,
      fileName,
      contentType,
      songId
    });
  }

  private async bySearchResult(request: Request) {
    const { songId, songTitle, byLinkUrl } = await request.json();
    if (byLinkUrl) {
      logger.log(
        `downloadTabService - bySearchResult - Getting tab from url: ${byLinkUrl}`
      );
      const { source } = await getSearchResultFromSongsterrUrl(byLinkUrl, {
        withBulkSongsToDownload: true
      });
      if (source) {
        return this.bySource({} as Request, {
          requestParams: { songTitle, source }
        });
      }
    }
    const link = await getDownloadLinkFromSongId(songId);
    if (!link) {
      throw new Error(`Unable to find download link from song: ${songTitle}`);
    }

    const { buffer, contentType } =
      await this.fetcher.fetchAndReturnArrayBuffer(link);

    const fileName = buildFileNameFromSongName(songTitle, link);
    return this.createDownloadResponse({
      buffer,
      fileName,
      contentType,
      songId
    });
  }

  private async bulk(request: Request) {
    const { artistId, artistName } = await this.paramsHelper.getRequiredParams<{
      artistId: string;
      artistName: string;
    }>({
      request,
      params: ['artistId', 'artistName']
    });

    try {
      const zip = await new BulkDownloadService(artistId).getZipFileOfAllTabs();

      return this.createDownloadResponse({
        buffer: zip.toBuffer(),
        fileName: `${normalize(artistName)}-tabs`,
        contentType: 'application/zip',
        songId: 0
      });
    } catch (e) {
      console.error('BULK UPLOAD FAILURE:', e);
      throw new Error(
        "Bulk upload failed, contact me and I'll resolve it immediately"
      );
    }
  }

  private createDownloadResponse({
    buffer,
    fileName,
    songId,
    contentType = 'application/gp'
  }: {
    buffer: ArrayBuffer;
    fileName: string;
    songId: number;
    contentType?: string;
  }): DownloadResponse {
    return {
      file: convertArrayBufferToArray(buffer),
      fileName,
      songId,
      contentType
    };
  }
}

interface DownloadResponse {
  file: number[];
  fileName: string;
  contentType: string;
  songId: number;
}

interface BySourceOptions {
  requestParams?: {
    source: string;
    songTitle: string;
  };
}
