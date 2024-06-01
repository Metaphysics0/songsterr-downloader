import Fetcher from '$lib/utils/fetch';
import {
  buildFileNameFromSongName,
  getDownloadLinkFromSongId,
  getSearchResultFromSongsterrUrl
} from './songsterr.service';
import { convertArrayBufferToArray } from '$lib/utils/array';
import { BULK_DOWNLOAD_SECRET } from '$env/static/private';
import { BulkDownloadService } from './bulkDownload.service';
import { normalize } from '$lib/utils/string';
import type { DownloadTabType } from '$lib/types/downloadType';
import { UltimateGuitarService } from './ultimateGuitar.service';
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
    if (this.downloadTabType === 'ultimate-guitar') {
      return this.fromUltimateGuitar(request);
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
    const link = await getDownloadLinkFromSongId(songId);
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

  private async fromUltimateGuitar(request: Request) {
    const { byLinkUrl } = await request.json();

    if (!byLinkUrl) {
      throw new Error('required param byLinkUrl not present');
    }

    const service = new UltimateGuitarService(byLinkUrl);
    const { buffer } = await service.download();

    return {
      fromUltimateGuitar: true,
      file: convertArrayBufferToArray(buffer),
      fileName: service.fileNameFromUrl,
      contentType: 'application/gp'
    };
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
