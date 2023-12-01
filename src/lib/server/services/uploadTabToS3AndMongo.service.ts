import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { DownloadLinkRepository } from '../repositories/downloadLink.repository';
import {
  S3Repository,
  type WriteToS3Args
} from '../repositories/s3.repository';
import { logger } from '$lib/utils/logger';
import type { Prisma } from '@prisma/client';

export default class UploadTabToS3AndMongoService {
  constructor(
    private s3Repository = new S3Repository(),
    private downloadLinkRepository = new DownloadLinkRepository()
  ) {}

  async call({
    s3Data,
    mongoData
  }: {
    s3Data: WriteToS3Args;
    mongoData: Prisma.GuitarProTabDownloadLinksCreateInput;
  }) {
    try {
      const s3DownloadLink = await this.s3Repository.writeIfNotExists(s3Data);
      await this.downloadLinkRepository.upsertBySongsterrSongId(
        mongoData.songsterrSongId,
        mongoData
      );

      return s3DownloadLink;
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
