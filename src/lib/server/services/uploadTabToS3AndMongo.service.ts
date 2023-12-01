import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { DownloadLinkRepository } from '../repositories/downloadLink.repository';
import { S3Repository } from '../repositories/s3.repository';
import { logger } from '$lib/utils/logger';

export default class UploadTabToS3AndMongoService {
  constructor(
    private s3Repository = new S3Repository(),
    private downloadLinkRepository = new DownloadLinkRepository()
  ) {}

  async call({
    fileName,
    artist,
    data,
    songsterrSongId,
    songsterrDownloadLink
  }: {
    artist: string;
    fileName: string;
    data: PutObjectCommandInput['Body'];
    songsterrSongId: string;
    songsterrDownloadLink: string;
  }): Promise<string | null> {
    try {
      const s3DownloadLink = await this.s3Repository.writeIfNotExists({
        fileName,
        artist,
        data
      });
      console.log('S3 DOWNLOAD LINK', s3DownloadLink);

      const uploadResponse =
        await this.downloadLinkRepository.upsertByS3DownloadLink({
          s3DownloadLink,
          songsterrSongId,
          songsterrDownloadLink
        });

      return uploadResponse.s3DownloadLink;
    } catch (error) {
      logger.error('uploadTabToS3AndMongoService failed', error);
      return '';
    }
  }

  async getS3DownloadLinkBySongsterrSongId(songsterrSongId: string) {
    try {
      const link =
        await this.downloadLinkRepository.getS3DownloadLinkSongsterrSongId(
          songsterrSongId
        );
      if (link) {
        logger.log('retrieved existing s3 download link from mongo');
        return link;
      }
    } catch (error) {
      logger.error('#getS3DownloadLinkBySongsterrSongId failed', error);
      return '';
    }
  }
}
