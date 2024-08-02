import Fetcher from '$lib/utils/fetch';
import {
  buildFileNameFromSongName,
  getDownloadLinkFromSongId,
  getSearchResultFromSongsterrUrl
} from './songsterr.service';
import { convertArrayBufferToArray } from '$lib/utils/array';
import { BULK_DOWNLOAD_SECRET } from '$env/static/private';
import { normalize } from '$lib/utils/string';
import { UltimateGuitarService } from './ultimateGuitar.service';
import { ParamsHelper } from '../utils/params';
import { logger } from '$lib/utils/logger';
import { DownloadTabType } from '$lib/types/downloadType';
import { BulkDownloadService } from './bulk-download/service';

export class DownloadTabService {
  private readonly fetcher = new Fetcher();
  private readonly paramsHelper = new ParamsHelper();
  constructor(private readonly downloadTabType: DownloadTabType) {}

  async download(request: Request): Promise<DownloadResponse> {
    return this.downloadMethod(request);
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

  private get downloadMethod() {
    if (!(this.downloadTabType in this.downloadTypeToDownloadMethodMap)) {
      throw new Error(`Unknown download type: ${this.downloadTabType}`);
    }

    return this.downloadTypeToDownloadMethodMap[this.downloadTabType];
  }

  private readonly downloadTypeToDownloadMethodMap: Record<
    DownloadTabType,
    (req: Request) => Promise<any>
  > = {
    [DownloadTabType.bySearchResult]: this.bySearchResult,
    [DownloadTabType.bySource]: this.bySource,
    [DownloadTabType.bulk]: this.bulk,
    [DownloadTabType['ultimate-guitar']]: this.fromUltimateGuitar
  };
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
