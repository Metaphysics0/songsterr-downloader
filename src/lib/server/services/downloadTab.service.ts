import Fetcher from '$lib/utils/fetch';
import {
  buildFileNameFromSongName,
  getDownloadLinkFromSongId
} from './songsterr.service';
import UploadTabToS3AndMongoService from './uploadTabToS3AndMongo.service';
import { convertArrayBufferToArray } from '$lib/utils/array';
import { BULK_DOWNLOAD_SECRET } from '$env/static/private';
import { BulkDownloadService } from './bulkDownload.service';
import { normalize } from '$lib/utils/string';
import { GUITAR_PRO_CONTENT_TYPE } from '$lib/constants';
import type { DownloadTabType } from '$lib/types/downloadType';
import { UltimateGuitarService } from './ultimateGuitar.service';

export class DownloadTabService {
  readonly downloadTabType: DownloadTabType;

  constructor(
    downloadTabType: DownloadTabType,
    private uploadService = new UploadTabToS3AndMongoService(),
    private fetcher = new Fetcher()
  ) {
    this.downloadTabType = downloadTabType;
  }

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

  private async bySource(request: Request) {
    const { source, songTitle, songId, artist, byLinkUrl } =
      await request.json();

    const existingDownloadLink =
      await this.uploadService.getS3DownloadLinkBySongsterrSongId(songId);

    const { buffer, downloadResponse } =
      await this.fetcher.fetchAndReturnArrayBuffer(
        existingDownloadLink || source
      );

    const fileName = buildFileNameFromSongName(songTitle, source);

    if (!existingDownloadLink) {
      await this.uploadService.call({
        s3Data: {
          fileName,
          data: Buffer.from(buffer),
          artist
        },
        mongoData: {
          songTitle,
          artist,
          songsterrSongId: String(songId),
          songsterrOriginUrl: byLinkUrl,
          songsterrDownloadLink: source
        }
      });
    }

    return {
      file: convertArrayBufferToArray(buffer),
      fileName,
      contentType:
        downloadResponse.headers.get('Content-Type') || GUITAR_PRO_CONTENT_TYPE
    };
  }

  private async bySearchResult(request: Request) {
    const { songId, songTitle, byLinkUrl, artist } = await request.json();
    if (!songId) throw 'Unable to find the song id from the params';

    const existingDownloadLink =
      await this.uploadService.getS3DownloadLinkBySongsterrSongId(songId);

    const link =
      existingDownloadLink ||
      (await getDownloadLinkFromSongId(songId, { byLinkUrl }));

    if (!link && !existingDownloadLink) throw 'Unable to find download link';

    const { downloadResponse, buffer } =
      await this.fetcher.fetchAndReturnArrayBuffer(
        existingDownloadLink || link
      );
    const fileName = buildFileNameFromSongName(
      songTitle,
      existingDownloadLink || link
    );

    if (!existingDownloadLink) {
      await this.uploadService.call({
        s3Data: {
          fileName,
          data: Buffer.from(buffer),
          artist
        },
        mongoData: {
          songTitle,
          artist,
          songsterrSongId: String(songId),
          songsterrOriginUrl: byLinkUrl,
          songsterrDownloadLink: link
        }
      });
    }

    return {
      file: convertArrayBufferToArray(buffer),
      fileName,
      contentType:
        downloadResponse.headers.get('Content-Type') || 'application/gp'
    };
  }

  private async bulk(request: Request) {
    const { artistId, secretAccessCode, artistName } = await request.json();
    if (!artistId) throw new Error('missing artistId');

    if (secretAccessCode !== BULK_DOWNLOAD_SECRET)
      throw new Error('Invalid bulk download code');

    try {
      const zip = await new BulkDownloadService(artistId).getZipFileOfAllTabs();

      return {
        file: Array.from(new Uint8Array(zip.toBuffer())),
        fileName: `${normalize(artistName)}-tabs`,
        contentType: 'application/zip'
      };
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
}

interface DownloadResponse {
  file: number[];
  fileName: string;
  contentType: string;
}
