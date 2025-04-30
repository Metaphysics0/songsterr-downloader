import Fetcher from '$lib/utils/fetch';
import {
  buildFileNameFromSongName,
  getDownloadLinksFromRevisions,
  getSearchResultFromSongsterrUrl
} from './songsterr.service';
import { convertArrayBufferToArray } from '$lib/utils/array';
import { BULK_DOWNLOAD_SECRET } from '$env/static/private';
import { BulkDownloadService } from './bulkDownload.service';
import { normalize } from '$lib/utils/string';
import type { DownloadTabType } from '$lib/types/downloadType';
import { ParamsHelper } from '../utils/params';
import { logger } from '$lib/utils/logger';

export class DownloadTabService {
  private readonly fetcher = new Fetcher();
  private readonly paramsHelper = new ParamsHelper();
  constructor(private readonly downloadTabType: DownloadTabType) {}

  async download(request: Request): Promise<DownloadResponse> {
    if (this.downloadTabType === 'bySearchResult') {
      return this.bySearchResult(request);
    }
    if (this.downloadTabType === 'bySource') {
      return this.bySource(request);
    }
    if (this.downloadTabType === 'bulk') {
      return this.bulk(request);
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
      const { source } = await getSearchResultFromSongsterrUrl(byLinkUrl, {
        withBulkSongsToDownload: true
      });
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

  private async bulk(request: Request) {
    const { artistId, secretAccessCode, artistName } =
      await this.paramsHelper.getRequiredParams<{
        artistId: string;
        secretAccessCode: string;
        artistName: string;
      }>({
        request,
        params: ['artistId', 'secretAccessCode', 'artistName']
      });

    if (secretAccessCode !== BULK_DOWNLOAD_SECRET) {
      throw new Error('Invalid bulk download code');
    }

    try {
      const zip = await new BulkDownloadService(artistId).getZipFileOfAllTabs();

      return this.createDownloadResponse({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        buffer: zip.toBuffer(),
        fileName: `${normalize(artistName)}-tabs`,
        contentType: 'application/zip'
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
